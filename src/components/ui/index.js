// Shared UI kit — page shell, surfaces, tables and status primitives.
// Styles live in the "DESIGN SYSTEM" section of src/index.css.
export { default as PageContainer } from './PageContainer';
export { default as PageHeader } from './PageHeader';
export { default as ContentCard } from './ContentCard';
export { default as DataTable, TableEmpty } from './DataTable';
export { TableActions, ActionButton, DeleteAction } from './TableActions';
export { default as StatusTag, getStatusTone } from './StatusTag';
export { default as StatCard, StatGrid } from './StatCard';
export {
  EmptyCell,
  PrimaryCell,
  TextCell,
  MutedCell,
  MonoCell,
  DateCell,
  renderText,
  renderPrimary,
  renderMuted,
  renderMono,
  renderDate,
} from './TableCells';
