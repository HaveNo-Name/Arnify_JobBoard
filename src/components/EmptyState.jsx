export default function EmptyState({ title = 'Nothing here yet', message = '', action }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center px-4">
      <div className="text-5xl mb-4">📭</div>
      <h3 className="text-lg font-semibold text-gray-700 mb-1">{title}</h3>
      {message && <p className="text-gray-400 text-sm max-w-sm mb-4">{message}</p>}
      {action && (
        <button onClick={action.onClick} className="mt-2 text-sm bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition">
          {action.label}
        </button>
      )}
    </div>
  )
}
