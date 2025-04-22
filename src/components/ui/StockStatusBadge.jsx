// src/components/ui/StockStatusBadge.jsx
export default function StockStatusBadge({ quantity, threshold }) {
    const getStatus = () => {
      if (quantity === 0) return 'out';
      if (quantity <= threshold) return 'low';
      return 'in';
    };
  
    const status = getStatus();
  
    const statusClasses = {
      in: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      low: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      out: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    };
  
    const statusIcons = {
      in: '✅',
      low: '⚠️',
      out: '❌'
    };
  
    const statusText = {
      in: 'In Stock',
      low: 'Low Stock',
      out: 'Out of Stock'
    };
  
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClasses[status]}`}
      >
        {statusIcons[status]} {statusText[status]} ({quantity})
      </span>
    );
  }