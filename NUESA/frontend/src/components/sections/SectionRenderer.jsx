import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import HeroSection from './HeroSection';
import CountersSection from './CountersSection';
import DepartmentsGrid from './DepartmentsGrid';
import AlumniSection from './AlumniSection';
import CompaniesSection from './CompaniesSection';

const renderers = {
  hero: HeroSection,
  counters: CountersSection,
  cards: DepartmentsGrid,
  alumni: AlumniSection,
  companies: CompaniesSection,
};

const defaultSections = [
  { id: 'hero', section_type: 'hero', content: null },
  { id: 'counters', section_type: 'counters', content: null },
  { id: 'cards', section_type: 'cards', content: null },
  { id: 'alumni', section_type: 'alumni', content: null },
  { id: 'companies', section_type: 'companies', content: null },
];

export default function SectionRenderer() {
  const { data: sections, isLoading, isError } = useQuery({
    queryKey: ['sections'],
    queryFn: () => api.getSections(),
    retry: 1,
    staleTime: 300000,
  });

  if (isLoading && !sections) {
    return (
      <div className="d-flex justify-content-center py-5">
        <div className="spinner-border text-nuesa-orange" role="status" />
      </div>
    );
  }

  const items = sections?.length ? sections : defaultSections;

  return (
    <>
      {items.map(section => {
        const Component = renderers[section.section_type];
        if (!Component) return null;
        return <Component key={section.id} content={section.content} />;
      })}
    </>
  );
}
