import MainPage from "./mainpage/page"
import ClientLayout from "./client_layout"


export default function Home() {
  return (
    <ClientLayout>
      <main><MainPage /></main>
    </ClientLayout>
  );
}