export default function App() {
  window.electron.onMessage((data) => {
    console.log("Received from main:", data);
    Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
            new Notification("New message", {
            body: data.message,
            });
        }
    });
  });
  return (
    <div>
      <h1>Notify</h1>
      <p>Get notified</p>
    </div>
  );
}
