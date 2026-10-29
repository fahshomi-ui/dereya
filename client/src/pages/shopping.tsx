export default function Page() {
  return (
    <iframe
      src={"/.netlify/functions/live-page?p=" + encodeURIComponent("/ar/things-to-do/shopping")}
      title="/ar/things-to-do/shopping"
      style={{ position: "fixed", inset: 0, width: "100%", height: "100%", border: 0, background: "#FAF7F2", zIndex: 1 }}
    />
  );
}
