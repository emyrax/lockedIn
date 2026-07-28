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

export default function SectionRenderer() {
  const { data: sections, isLoading } = useQuery({
    queryKey: ['sections'],
    queryFn: () => api.getSections(),
  });

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center py-5">
        <div className="spinner-border text-nuesa-orange" role="status" />
      </div>
    );
  }

  return (
    <>
      {sections?.map(section => {
        const Component = renderers[section.section_type];
        if (!Component) return null;
        return <Component key={section.id} content={section.content} />;
      })}
    </>
  );
}
