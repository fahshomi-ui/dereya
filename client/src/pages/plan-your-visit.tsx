export default function Page() {
  return (
    <iframe
      src={"/.netlify/functions/live-page?p=" + encodeURIComponent("/ar/plan-your-visit")}
      title="/ar/plan-your-visit"
      style={{ position: "fixed", inset: 0, width: "100%", height: "100%", border: 0, background: "#FAF7F2", zIndex: 1 }}
    />
  );
}
