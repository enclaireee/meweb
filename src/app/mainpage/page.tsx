import React from 'react'
import ClientLayout from "../client_layout";
import Experience from "./experience"
import ContactMe from "./contactme"

function Page() {
  return (
    <ClientLayout>
        <LandingPage />
        <AboutMe />
        <Experience />
        <ContactMe />
    </ClientLayout>
  )
}

export default Page
