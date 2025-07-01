import { useState, useEffect, useRef } from 'react';
import Manager from './components/Manager';
import Footer from './components/Footer';
function App() {
  return (
    <>
      <Manager theme="cyberpunk" />
      <Footer />
    </>
  );
}

export default App;
