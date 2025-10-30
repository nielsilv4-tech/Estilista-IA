import React, { useState, useCallback } from 'react';
import { generateCompositeImage } from './services/geminiService';
import { fileToBase64 } from './utils/fileUtils';
import { ImageFile } from './types';

// SVG Icons
const UploadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
  </svg>
);

const MagicWandIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c.907 0 1.63.723 1.63 1.63S12.907 14.26 12 14.26s-1.63-.723-1.63-1.63.723-1.63 1.63-1.63zM12 21c4.97 0 9-4.03 9-9s-4.03-9-9-9-9 4.03-9 9 4.03 9 9 9zM5 12l1.5-1.5L5 9" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 12l-1.5 1.5L19 15" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5l1.5 1.5L12 8" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l-1.5-1.5L12 16" />
  </svg>
);

const DownloadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
);

const Spinner = () => (
  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);


function App() {
  const [personImage, setPersonImage] = useState<ImageFile | null>(null);
  const [itemImages, setItemImages] = useState<ImageFile[]>([]);
  const [prompt, setPrompt] = useState<string>('');
  const [finalImage, setFinalImage] = useState<string | null>(null);
  
  const [isLoadingImage, setIsLoadingImage] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handlePersonImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        setPersonImage({
            id: crypto.randomUUID(),
            url: URL.createObjectURL(file),
            file
        });
    }
  };

  const handleItemImagesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
        const fileArray = Array.from(files).map(file => ({
            id: crypto.randomUUID(),
            url: URL.createObjectURL(file),
            file
        }));
        setItemImages(prev => [...prev, ...fileArray]);
    }
  };
    
  const removeItemImage = (id: string) => {
    setItemImages(prev => prev.filter(image => image.id !== id));
  };

  const handleGenerateImage = useCallback(async () => {
    if (!personImage) {
      setError('Por favor, envie a foto de uma pessoa primeiro.');
      return;
    }
    setError(null);
    setIsLoadingImage(true);
    setFinalImage(null);

    try {
      const personImageBase64 = await fileToBase64(personImage.file);
      const itemImagesBase64 = await Promise.all(
        itemImages.map(img => fileToBase64(img.file))
      );
      
      const generatedImageBase64 = await generateCompositeImage(
        personImageBase64,
        itemImagesBase64,
        prompt
      );
      
      setFinalImage(generatedImageBase64);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Ocorreu um erro desconhecido durante a geração da imagem.');
    } finally {
      setIsLoadingImage(false);
    }
  }, [personImage, itemImages, prompt]);

  const handleDownloadImage = () => {
    if (!finalImage) return;
    const link = document.createElement('a');
    link.href = `data:image/png;base64,${finalImage}`;
    link.download = 'estilista-ia-imagem.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans p-4 sm:p-6 lg:p-8">
      <header className="text-center mb-10">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-500">
          Estilista IA
        </h1>
        <p className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto">
          Estilize seu visual com IA. Envie imagens e descreva sua visão para criar uma imagem única.
        </p>
      </header>
      
      <main className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {/* Column 1: Uploads */}
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-gray-800 p-6 rounded-2xl shadow-lg">
            <h2 className="text-2xl font-bold mb-4 border-b border-gray-700 pb-2">1. Envie as Imagens</h2>
            
            <h3 className="text-lg font-semibold text-purple-300 mb-2">Pessoa Principal</h3>
            <div className="mb-4">
              <label htmlFor="person-upload" className="flex items-center justify-center w-full px-4 py-6 bg-gray-700 text-gray-400 rounded-lg cursor-pointer hover:bg-gray-600 hover:text-white transition-colors">
                <UploadIcon />
                <span>{personImage ? 'Trocar Foto' : 'Enviar Foto'}</span>
              </label>
              <input id="person-upload" type="file" className="hidden" accept="image/*" onChange={handlePersonImageUpload} />
            </div>
            {personImage && (
              <div className="relative group">
                <img src={personImage.url} alt="Pessoa Principal" className="w-full h-auto rounded-lg" />
                <button onClick={() => setPersonImage(null)} className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">&times;</button>
              </div>
            )}

            <h3 className="text-lg font-semibold text-purple-300 mt-6 mb-2">Roupas e Itens</h3>
            <div className="mb-4">
               <label htmlFor="items-upload" className="flex items-center justify-center w-full px-4 py-6 bg-gray-700 text-gray-400 rounded-lg cursor-pointer hover:bg-gray-600 hover:text-white transition-colors">
                <UploadIcon />
                <span>Enviar Itens</span>
              </label>
              <input id="items-upload" type="file" multiple className="hidden" accept="image/*" onChange={handleItemImagesUpload} />
            </div>
            <div className="grid grid-cols-3 gap-4">
              {itemImages.map(image => (
                <div key={image.id} className="relative group">
                  <img src={image.url} alt="Item" className="w-full h-24 object-cover rounded-md" />
                  <button onClick={() => removeItemImage(image.id)} className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity">&times;</button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Column 2: Controls & Generation */}
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-gray-800 p-6 rounded-2xl shadow-lg">
            <h2 className="text-2xl font-bold mb-4 border-b border-gray-700 pb-2">2. Descreva e Gere</h2>
            <textarea
              className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
              rows={4}
              placeholder="ex: 'coloque a pessoa em uma praia ao pôr do sol', 'mude a cor da camisa para vermelho'"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            <button
              onClick={handleGenerateImage}
              disabled={isLoadingImage || !personImage}
              className="mt-4 w-full flex items-center justify-center bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-bold py-3 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isLoadingImage ? <><Spinner /> Gerando...</> : <><MagicWandIcon/>Gerar Imagem</>}
            </button>
          </div>
        </div>

        {/* Column 3: Results */}
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-gray-800 p-6 rounded-2xl shadow-lg min-h-[300px]">
            <h2 className="text-2xl font-bold mb-4 border-b border-gray-700 pb-2">3. Resultado</h2>
            {error && <div className="bg-red-900 border border-red-700 text-red-200 p-3 rounded-lg mb-4">{error}</div>}

            <div className="space-y-4">
              {isLoadingImage && <div className="flex justify-center items-center h-48"><Spinner /> <span className="ml-2">Criando sua obra de arte...</span></div>}
              {finalImage && (
                <div>
                  <h3 className="text-lg font-semibold text-purple-300 mb-2">Imagem Final</h3>
                  <img src={`data:image/png;base64,${finalImage}`} alt="Gerada" className="w-full h-auto rounded-lg shadow-md" />
                  
                  <button
                    onClick={handleDownloadImage}
                    className="mt-4 w-full flex items-center justify-center bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition-all"
                  >
                    <DownloadIcon />
                    Baixar Imagem
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;