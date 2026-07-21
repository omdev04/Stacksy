import { Layout } from './components/Layout';
import { Grid } from './components/Gallery/Grid';
import { Stream } from './components/Feed/Stream';
import { Modal } from './components/Interaction/Modal';

function App() {
  return (
    <>
      <Layout 
        galleryComponent={<Grid />} 
        feedComponent={<Stream />} 
      />
      {/* Detail overlay modal */}
      <Modal />
    </>
  );
}

export default App;
