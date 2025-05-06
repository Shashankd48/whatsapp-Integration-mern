import { useState } from "react";

import "./App.css";
import { Button } from "@heroui/react";

function App() {
   return (
      <main className="max-w-[1200px] m-auto py-6">
         <h2 className="text-2xl">Whats app integration</h2>
         <Button variant="bordered" color="secondary">
            Connect whats app
         </Button>
      </main>
   );
}

export default App;
