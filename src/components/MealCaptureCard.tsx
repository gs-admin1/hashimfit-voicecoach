
import { useState, useRef } from "react";
import { Camera, Upload, X } from "lucide-react";
import { AnimatedCard } from "./ui-components";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/useAuth";
import supabase from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export function MealCaptureCard() {
  const [isCapturing, setIsCapturing] = useState(false);
  const [showCameraDialog, setShowCameraDialog] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [mealType, setMealType] = useState<string>("breakfast");
  const [isProcessing, setIsProcessing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { userId } = useAuth();
  
  const openCamera = async () => {
    setShowCameraDialog(true);
    
    // Wait for dialog to open before accessing video element
    setTimeout(async () => {
      try {
        if (videoRef.current) {
          const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: 'environment' }
          });
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error("Error accessing camera:", error);
        toast({
          title: "Camera Error",
          description: "Could not access your camera. Please check permissions.",
          variant: "destructive",
        });
      }
    }, 100);
  };
  
  const closeCamera = () => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
    }
    setShowCameraDialog(false);
  };
  
  const takePicture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (context) {
        // Set canvas dimensions to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // Draw video frame to canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convert canvas to blob
        canvas.toBlob(async (blob) => {
          if (blob) {
            const file = new File([blob], `meal-${Date.now()}.jpg`, { type: 'image/jpeg' });
            setSelectedFile(file);
            setImagePreview(URL.createObjectURL(blob));
            
            // Stop camera stream
            const tracks = (video.srcObject as MediaStream).getTracks();
            tracks.forEach(track => track.stop());
          }
        }, 'image/jpeg', 0.8);
      }
    }
    setShowCameraDialog(false);
  };
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };
  
  const handleSelectFile = () => {
    fileInputRef.current?.click();
  };
  
  const handleRemoveImage = () => {
    setSelectedFile(null);
    setImagePreview(null);
    setAnalysisResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const processMealImage = async () => {
    if (!selectedFile || !userId) {
      toast({
        title: "Error",
        description: "Please select an image first or log in to continue.",
        variant: "destructive",
      });
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // Step 1: Upload image to Supabase Storage
      const fileName = `${userId}/meals/${Date.now()}-${selectedFile.name}`;
      
      toast({
        title: "Uploading photo",
        description: "Uploading your meal photo...",
      });
      
      console.log("Uploading image to Supabase Storage:", fileName);
      const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from('meal-images')
        .upload(fileName, selectedFile);
        
      if (uploadError) {
        console.error("Upload error:", uploadError);
        throw new Error(`Failed to upload image: ${uploadError.message}`);
      }
      
      // Get public URL for the uploaded image
      const { data: urlData } = supabase
        .storage
        .from('meal-images')
        .getPublicUrl(fileName);
        
      const imageUrl = urlData.publicUrl;
      console.log("Image uploaded successfully. URL:", imageUrl);
      
      toast({
        title: "Analyzing photo",
        description: "Detecting food items, estimating portions, and calculating nutrition...",
      });
      
      // Step 2: Call Supabase Edge Function to process the image
      console.log("Calling analyze-meal-photo function with data:", {
        imageUrl,
        userId,
        mealType,
      });
      
      const { data, error } = await supabase.functions.invoke('analyze-meal-photo', {
        body: {
          imageUrl,
          userId,
          mealType,
        },
      });
      
      console.log("Function response:", data);
      
      if (error) {
        console.error("Function error:", error);
        throw new Error(`Function error: ${error.message}`);
      }
      
      if (!data.success) {
        console.error("Function returned failure:", data.error);
        throw new Error(data.error || "Failed to analyze meal");
      }
      
      // Store analysis result
      setAnalysisResult(data.nutritionData);
      
      // Success!
      toast({
        title: "Analysis complete!",
        description: `Detected: ${data.nutritionData.meal_title} (${data.nutritionData.total.calories} calories)`,
      });
      
    } catch (error) {
      console.error("Error processing meal:", error);
      toast({
        title: "Error analyzing meal",
        description: error.message || "Failed to process your meal photo",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setImagePreview(null);
    setAnalysisResult(null);
    setMealType("breakfast");
  };

  return (
    <>
      <AnimatedCard className="relative overflow-hidden">
        <div className="flex flex-col items-center justify-center py-4">
          {imagePreview ? (
            <div className="relative w-full max-w-xs mx-auto mb-4">
              <img 
                src={imagePreview} 
                alt="Meal preview" 
                className="w-full h-auto rounded-lg object-cover"
              />
              <button
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full"
              >
                <X size={18} />
              </button>
            </div>
          ) : (
            <div className="flex flex-row gap-3 mb-4">
              <button
                onClick={openCamera}
                className={cn(
                  "relative rounded-full p-6 transition-all duration-300",
                  isCapturing 
                    ? "bg-hashim-600" 
                    : "bg-hashim-500 hover:bg-hashim-600"
                )}
              >
                <Camera className="text-white" size={28} />
              </button>
              
              <button
                onClick={handleSelectFile}
                className="relative rounded-full p-6 transition-all duration-300 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
              >
                <Upload className="text-gray-700 dark:text-gray-200" size={28} />
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </button>
            </div>
          )}
          
          <div className="text-center">
            <h3 className="font-bold text-lg mb-1">
              {imagePreview ? (analysisResult ? "Meal Analyzed" : "Ready to Analyze") : "Snap a Snack"}
            </h3>
            <p className="text-muted-foreground text-sm mb-4">
              {analysisResult 
                ? `${analysisResult.total.calories} calories | ${analysisResult.total.protein_g}g protein`
                : imagePreview 
                  ? "We'll detect food items, estimate portions, and calculate nutrition" 
                  : "Take a photo of your meal for nutritional info"}
            </p>
            
            {imagePreview && !analysisResult && (
              <div className="space-y-4 w-full max-w-xs mx-auto">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Meal Type:</label>
                  <Select
                    value={mealType}
                    onValueChange={setMealType}
                    disabled={isProcessing}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select meal type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="breakfast">Breakfast</SelectItem>
                      <SelectItem value="lunch">Lunch</SelectItem>
                      <SelectItem value="dinner">Dinner</SelectItem>
                      <SelectItem value="snack">Snack</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Button 
                  className="w-full" 
                  onClick={processMealImage}
                  disabled={isProcessing}
                >
                  {isProcessing ? "Processing..." : "Analyze Meal"}
                </Button>
              </div>
            )}
            
            {analysisResult && (
              <div className="space-y-4 w-full max-w-xs mx-auto">
                <div className="mt-4 border rounded-lg p-3 bg-gray-50 dark:bg-gray-800">
                  <h4 className="font-medium text-left mb-2">Detected Foods:</h4>
                  <ul className="space-y-2 text-left text-sm">
                    {analysisResult.food_items.map((item: any, index: number) => (
                      <li key={index} className="flex justify-between">
                        <span>{item.name} <span className="text-gray-500">({item.portion})</span></span>
                        <span className="font-medium">{item.calories} cal</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-3 pt-3 border-t flex justify-between text-sm font-medium">
                    <span>Total</span>
                    <span>{analysisResult.total.calories} calories</span>
                  </div>
                </div>
                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={resetForm}
                >
                  Log Another Meal
                </Button>
              </div>
            )}
          </div>
        </div>
      </AnimatedCard>
      
      {/* Camera Dialog */}
      <Dialog open={showCameraDialog} onOpenChange={(open) => !open && closeCamera()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Take a Photo</DialogTitle>
          </DialogHeader>
          
          <div className="relative aspect-video bg-black rounded-md overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            <canvas ref={canvasRef} className="hidden" />
          </div>
          
          <DialogFooter className="sm:justify-between">
            <Button variant="outline" onClick={closeCamera}>Cancel</Button>
            <Button onClick={takePicture}>Capture</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
