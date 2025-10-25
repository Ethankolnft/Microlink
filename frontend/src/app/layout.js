export const metadata = {
  title: "Microlink",
  description: "Create short links",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
