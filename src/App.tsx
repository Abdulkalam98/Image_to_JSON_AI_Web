import React, { useState, useEffect } from "react";
import { Sun, Moon, Upload, Download } from "lucide-react";

interface Metadata {
  fileName: string;
  fileType: string;
  fileSize: string;
  dimensions: string;
  uploadTime: string;
}

const toggleTheme = (darkMode: boolean) => {
  document.documentElement.classList.toggle("dark", darkMode);
};

const Website: React.FC = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [metadata, setMetadata] = useState<Metadata | null>(null);

  const defaultJson: Metadata = {
    fileName: "default",
    fileType: "image/*",
    fileSize: "0 KB",
    dimensions: "0x0",
    uploadTime: new Date().toISOString(),
  };

  useEffect(() => {
    toggleTheme(darkMode);
  }, [darkMode]);

  const processImage = async (file: File): Promise<void> => {
    if (file && file.type.startsWith("image/")) {
      setLoading(true);

      try {
        const response = await fetch("https://0hz34owtc1.execute-api.us-east-2.amazonaws.com/dev/img_json_resoure", {
          method: "POST",
          headers: {
            "Content-Type": "application/octet-stream",
            filename: file.name,
          },
          body: file,
        });

        if (!response.ok) {
          throw new Error(`Failed to upload image: ${response.statusText}`);
        }

        const jsonResponse = await response.json();
        setMetadata(jsonResponse);
      } catch (error) {
        console.error("Error processing image:", error);
        alert("Failed to process the image. Please check the file format or try again later.");
      } finally {
        setLoading(false);
      }
    } else {
      alert("Unsupported file format. Please upload a valid image file.");
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (file) {
      processImage(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (): void => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      processImage(file);
    }
  };

  const downloadJson = (): void => {
    try {
      const data = metadata || defaultJson;
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = metadata ? `${data.fileName}-metadata.json` : "default-metadata.json";
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading JSON:", error);
      alert("Failed to download the JSON file.");
    }
  };

  return (
    <div className={`min-h-screen ${darkMode ? "dark bg-gray-900" : "bg-gray-50"}`}>
      <header className="fixed w-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm z-50 border-b dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="text-2xl font-bold dark:text-white">AI-Powered Image to JSON Conversion</div>
            <div className="flex items-center gap-4">
              <span className="text-sm dark:text-white">
                {darkMode ? "Dark Mode" : "Light Mode"}
              </span>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {darkMode ? <Sun className="text-white" /> : <Moon />}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="pt-16">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4 dark:text-white">
              Upload Your Image and Get AI-Generated JSON File
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Upload an image and instantly download a JSON file with the image metadata
            </p>
          </div>

          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`
              border-2 border-dashed rounded-xl p-8 text-center transition-all
              ${isDragging ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" : 
                "border-gray-300 dark:border-gray-700"}
            `}
          >
            <input
              type="file"
              accept="image/*"
              onChange={handleFileInput}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <Upload className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
              <p className="text-gray-600 dark:text-gray-300">
                Drag and drop your image here, or click to browse
              </p>
            </label>
          </div>

          <button
            onClick={downloadJson}
            className={`
              w-full mt-8 flex items-center justify-center gap-2 p-4 rounded-lg font-semibold
              transition-all transform hover:scale-105 
              ${loading ? "animate-pulse" : ""} 
              ${metadata ? "bg-green-500 hover:bg-green-600" : "bg-blue-500 hover:bg-blue-600"}
              text-white
            `}
          >
            <Download className="h-5 w-5" />
            {loading ? "Processing..." : metadata ? "Download Image Metadata JSON" : "Download JSON"}
          </button>
        </div>
      </main>

      <footer className="border-t dark:border-gray-800 mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              © 2025 ImageToJSON. All rights reserved.
            </div>
            <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-400">
              <a href="#" className="hover:text-gray-900 dark:hover:text-white">Terms</a>
              <a href="#" className="hover:text-gray-900 dark:hover:text-white">Privacy</a>
              <a href="#" className="hover:text-gray-900 dark:hover:text-white">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Website;
