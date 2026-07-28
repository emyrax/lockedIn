import { Router } from 'express';
import { authenticate, optionalAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { supabase } from '../config/database.js';
import { ROLES } from '../config/constants.js';
import { z } from 'zod';
import { validate } from '../middleware/validate.js';

const router = Router();

router.get('/', optionalAuth, async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('sections')
      .select('*')
      .eq('is_active', true)
      .order('sort_order');

    if (error) throw error;

    const sectionsWithContent = await Promise.all(
      data.map(async (section) => {
        const { data: live } = await supabase
          .from('section_live')
          .select('version_id')
          .eq('section_id', section.id)
          .maybeSingle();

        if (!live) return { ...section, content: null, version: null };

        const { data: version } = await supabase
          .from('section_versions')
          .select('*')
          .eq('id', live.version_id)
          .single();

        return {
          ...section,
          content: version?.content || null,
          version: version?.version_number || null,
          published_at: version?.published_at || null,
        };
      })
    );

    res.json(sectionsWithContent);
  } catch (err) { next(err); }
});

router.get('/:slug', optionalAuth, async (req, res, next) => {
  try {
    const { data: section, error } = await supabase
      .from('sections')
      .select('*')
      .eq('slug', req.params.slug)
      .maybeSingle();

    if (error || !section) return res.status(404).json({ error: 'Section not found' });

    const { data: live } = await supabase
      .from('section_live')
      .select('version_id')
      .eq('section_id', section.id)
      .maybeSingle();

    if (!live) return res.json({ ...section, content: null, version: null });

    const { data: version } = await supabase
      .from('section_versions')
      .select('*')
      .eq('id', live.version_id)
      .single();

    res.json({ ...section, content: version?.content || null, version: version?.version_number || null });
  } catch (err) { next(err); }
});

router.get('/:slug/versions', authenticate, requireRole(ROLES.SUPER_ADMIN), async (req, res, next) => {
  try {
    const { data: section } = await supabase
      .from('sections')
      .select('id')
      .eq('slug', req.params.slug)
      .maybeSingle();

    if (!section) return res.status(404).json({ error: 'Section not found' });

    const { data: versions, error } = await supabase
      .from('section_versions')
      .select('*')
      .eq('section_id', section.id)
      .order('version_number', { ascending: false });

    if (error) throw error;

    const { data: live } = await supabase
      .from('section_live')
      .select('version_id')
      .eq('section_id', section.id)
      .maybeSingle();

    res.json({
      versions,
      live_version_id: live?.version_id || null,
    });
  } catch (err) { next(err); }
});

const createVersionSchema = z.object({
  content: z.record(z.any()),
  change_summary: z.string().min(3).max(500),
  session_tag: z.string().optional(),
});

router.post('/:slug/versions', authenticate, requireRole(ROLES.SUPER_ADMIN), validate(createVersionSchema), async (req, res, next) => {
  try {
    const { data: section } = await supabase
      .from('sections')
      .select('id')
      .eq('slug', req.params.slug)
      .maybeSingle();

    if (!section) return res.status(404).json({ error: 'Section not found' });

    const { data: lastVersion } = await supabase
      .from('section_versions')
      .select('version_number')
      .eq('section_id', section.id)
      .order('version_number', { ascending: false })
      .limit(1)
      .maybeSingle();

    const newVersionNumber = (lastVersion?.version_number || 0) + 1;

    const { data: version, error } = await supabase
      .from('section_versions')
      .insert({
        section_id: section.id,
        version_number: newVersionNumber,
        content: req.body.content,
        change_summary: req.body.change_summary,
        session_tag: req.body.session_tag || null,
        created_by: req.user.sub,
        published: false,
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(version);
  } catch (err) { next(err); }
});

router.patch('/:slug/versions/:versionId/publish', authenticate, requireRole(ROLES.SUPER_ADMIN), async (req, res, next) => {
  try {
    const { data: section } = await supabase
      .from('sections')
      .select('id')
      .eq('slug', req.params.slug)
      .maybeSingle();

    if (!section) return res.status(404).json({ error: 'Section not found' });

    const { data: version } = await supabase
      .from('section_versions')
      .select('*')
      .eq('id', req.params.versionId)
      .eq('section_id', section.id)
      .single();

    if (!version) return res.status(404).json({ error: 'Version not found' });

    const now = new Date().toISOString();
    await supabase.from('section_versions').update({ published: true, published_at: now }).eq('id', version.id);

    const { data: existingLive } = await supabase
      .from('section_live')
      .select('*')
      .eq('section_id', section.id)
      .maybeSingle();

    if (existingLive) {
      await supabase.from('section_live').update({ version_id: version.id, activated_at: now, activated_by: req.user.sub }).eq('section_id', section.id);
    } else {
      await supabase.from('section_live').insert({ section_id: section.id, version_id: version.id, activated_at: now, activated_by: req.user.sub });
    }

    await supabase.from('audit_log').insert({
      user_id: req.user.sub,
      action: 'section.publish',
      entity_type: 'section_version',
      entity_id: version.id,
      new_values: { section_slug: req.params.slug, version_number: version.version_number },
    });

    res.json({ message: 'Version published', version });
  } catch (err) { next(err); }
});

router.delete('/:slug/versions/:versionId', authenticate, requireRole(ROLES.SUPER_ADMIN), async (req, res, next) => {
  try {
    const { data: version } = await supabase
      .from('section_versions')
      .select('*')
      .eq('id', req.params.versionId)
      .single();

    if (!version) return res.status(404).json({ error: 'Version not found' });

    if (version.published) {
      return res.status(400).json({ error: 'Cannot delete a published version. Publish a different version first.' });
    }

    await supabase.from('section_versions').delete().eq('id', version.id);

    await supabase.from('audit_log').insert({
      user_id: req.user.sub,
      action: 'section.version_delete',
      entity_type: 'section_version',
      entity_id: version.id,
      old_values: { version_number: version.version_number, slug: req.params.slug },
    });

    res.json({ message: 'Version permanently deleted' });
  } catch (err) { next(err); }
});

export default router;
