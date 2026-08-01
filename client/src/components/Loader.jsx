const Loader = ({ label = 'Loading…', size = 'md' }) => {
  const dims = size === 'sm' ? 'h-5 w-5 border-2' : 'h-10 w-10 border-[3px]';

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12 text-teal-700">
      <span
        className={`${dims} rounded-full border-teal-200 border-t-clay-500 animate-spin`}
        aria-hidden="true"
      />
      <p className="text-sm font-medium text-teal-600">{label}</p>
    </div>
  );
};

export default Loader;
