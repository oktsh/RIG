export default async function GuideDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <div className="font-mono text-[10px] text-gray-500 uppercase tracking-widest mb-4">
          ГАЙД / {id}
        </div>
        <h2 className="font-display text-4xl font-bold uppercase tracking-tight">
          Guide Detail: {id}
        </h2>
      </div>
    </div>
  );
}
