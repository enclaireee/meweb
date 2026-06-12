import React from 'react'
import ClientLayout from "./client_layout";
import Experience from "./mainpage/experience"
import ContactMe from "./mainpage/contactme"

function Page() {
  return (
    <ClientLayout>
        <Experience />
        <ContactMe />
    </ClientLayout>
  )
}

export default Page
