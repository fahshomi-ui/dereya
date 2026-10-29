export default function Page() {
  return (
    <iframe
      src={"/.netlify/functions/live-page?p=" + encodeURIComponent("/ar/places-to-go/bujairi-terrace")}
      title="/ar/places-to-go/bujairi-terrace"
      style={{ position: "fixed", inset: 0, width: "100%", height: "100%", border: 0, background: "#FAF7F2", zIndex: 1 }}
    />
  );
}
