interface StatusViewProps {
  title: string
  description?: string
}

export const StatusView = ({ title, description }: StatusViewProps) => (
  <div className="admin-status-view" role="status">
    <p className="admin-status-title">{title}</p>
    {description ? <p className="admin-status-description">{description}</p> : null}
  </div>
)
