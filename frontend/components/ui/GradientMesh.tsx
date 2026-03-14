"use client";

export default function GradientMesh() {
  return (
    <>
      <style jsx>{`
        @keyframes drift-1 {
          0%, 100% { transform: translate(0%, 0%) scale(1); }
          33% { transform: translate(4%, 8%) scale(1.05); }
          66% { transform: translate(-3%, 3%) scale(0.97); }
        }
        @keyframes drift-2 {
          0%, 100% { transform: translate(0%, 0%) scale(1); }
          33% { transform: translate(-6%, -4%) scale(0.95); }
          66% { transform: translate(5%, -6%) scale(1.03); }
        }
        @keyframes drift-3 {
          0%, 100% { transform: translate(0%, 0%) scale(1); }
          33% { transform: translate(3%, -5%) scale(1.02); }
          66% { transform: translate(-4%, 5%) scale(0.98); }
        }
      `}</style>
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      >
        {/* Deep blue — top left */}
        <div
          className="absolute rounded-full"
          style={{
            width: "55vw",
            height: "55vw",
            maxWidth: 700,
            maxHeight: 700,
            top: "-8%",
            left: "-5%",
            background: "radial-gradient(circle, rgba(30,64,175,0.18) 0%, transparent 70%)",
            filter: "blur(80px)",
            animation: "drift-1 25s ease-in-out infinite",
          }}
        />
        {/* Cyan accent — mid right */}
        <div
          className="absolute rounded-full"
          style={{
            width: "40vw",
            height: "40vw",
            maxWidth: 550,
            maxHeight: 550,
            top: "35%",
            right: "-8%",
            background: "radial-gradient(circle, rgba(14,165,233,0.10) 0%, transparent 70%)",
            filter: "blur(90px)",
            animation: "drift-2 28s ease-in-out infinite",
          }}
        />
        {/* Slate blue — bottom center */}
        <div
          className="absolute rounded-full"
          style={{
            width: "50vw",
            height: "50vw",
            maxWidth: 650,
            maxHeight: 650,
            bottom: "-12%",
            left: "30%",
            background: "radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)",
            filter: "blur(100px)",
            animation: "drift-3 22s ease-in-out infinite",
          }}
        />
        {/* Subtle noise/grain overlay */}
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          }}
        />
      </div>
    </>
  );
}
