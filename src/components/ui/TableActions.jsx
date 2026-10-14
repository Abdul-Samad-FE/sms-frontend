import React from 'react';
import { Button, Popconfirm, Tooltip } from 'antd';

/**
 * Row actions are always text buttons ("View", "Edit", "Delete") — never
 * icon-only — so they are readable and accessible without hover tooltips.
 *
 *   <TableActions>
 *     <ActionButton onClick={...}>Edit</ActionButton>
 *     <DeleteAction title="Delete this user?" onConfirm={...} />
 *   </TableActions>
 */
export function TableActions({ children }) {
  return <div className="ds-table-actions">{children}</div>;
}

/**
 * Small outlined text button for a row action.
 *
 * @param {{
 *   children: React.ReactNode,
 *   onClick?: () => void,
 *   danger?: boolean,
 *   primary?: boolean,
 *   disabled?: boolean,
 *   loading?: boolean,
 *   tooltip?: React.ReactNode,
 * }} props
 */
export const ActionButton = React.forwardRef(function ActionButton(
  {
    children,
    onClick,
    danger = false,
    primary = false,
    disabled = false,
    loading = false,
    tooltip,
    ...rest
  },
  ref
) {
  const button = (
    <Button
      ref={ref}
      size="small"
      danger={danger}
      type={primary ? 'primary' : 'default'}
      ghost={primary}
      disabled={disabled}
      loading={loading}
      onClick={onClick}
      {...rest}
    >
      {children}
    </Button>
  );
  // Disabled buttons swallow pointer events, so wrap them for the tooltip.
  if (!tooltip) return button;
  return (
    <Tooltip title={tooltip}>
      <span className="inline-flex">{button}</span>
    </Tooltip>
  );
});

/**
 * "Delete" text button guarded by a confirmation popover.
 *
 * @param {{
 *   onConfirm: () => void,
 *   title?: React.ReactNode,
 *   description?: React.ReactNode,
 *   label?: React.ReactNode,
 *   okText?: string,
 *   disabled?: boolean,
 *   loading?: boolean,
 *   tooltip?: React.ReactNode,
 * }} props
 */
export function DeleteAction({
  onConfirm,
  title = 'Delete this item?',
  description = 'This action cannot be undone.',
  label = 'Delete',
  okText = 'Delete',
  disabled = false,
  loading = false,
  tooltip,
}) {
  const confirm = (
    <Popconfirm
      title={title}
      description={description}
      okText={okText}
      cancelText="Cancel"
      okButtonProps={{ danger: true }}
      placement="topRight"
      disabled={disabled}
      onConfirm={onConfirm}
    >
      {/* antd Button directly: Popconfirm needs a ref-able child. */}
      <Button size="small" danger disabled={disabled} loading={loading}>
        {label}
      </Button>
    </Popconfirm>
  );
  if (!tooltip) return confirm;
  return (
    <Tooltip title={tooltip}>
      <span className="inline-flex">{confirm}</span>
    </Tooltip>
  );
}
