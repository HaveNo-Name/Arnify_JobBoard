export default function ErrorState({ message = 'Something went wrong. Please try again.' }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center px-4">
      <div className="text-4xl mb-3">⚠️</div>
      <h3 className="text-lg font-semibold text-gray-800 mb-1">Error</h3>
      <p className="text-gray-500 text-sm max-w-sm">{message}</p>
    </div>
  )
}
