export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center text-center px-6">
      <p className="text-sm tracking-[0.35em] mb-8">
        MARK AT ZERO
      </p>

      <h1 className="text-6xl md:text-8xl font-bold tracking-tight">
        00:00:00
      </h1>

      <p className="mt-8 text-lg md:text-xl tracking-wide">
        ONE MILLION PEOPLE. ONE MOMENT.
      </p>

      <button className="mt-10 border border-white px-8 py-4 text-sm font-bold tracking-widest hover:bg-white hover:text-black transition">
        LEAVE YOUR MARK — €1
      </button>
    </main>
  );
}