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
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

export function MealCaptureCard() {
  const [isCapturing, setIsCapturing] = useState(false);
  const [showCameraDialog, setShowCameraDialog] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [mealType, setMealType] = useState<string>("breakfast");
  const [mealDescription, setMealDescription] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { isAuthenticated, userId } = useAuth();
  
  
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
    setMealDescription("");
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
      
      // Create custom prompt based on meal description
      let userPrompt = `Please analyze this ${mealType} image and identify all the food items you can see. Estimate realistic portion sizes and provide a comprehensive nutrition breakdown for each item. Consider this a typical adult meal portion.`;
      
      if (mealDescription.trim()) {
        userPrompt = `This meal was described by the user as: "${mealDescription.trim()}". Please use this description along with the photo to identify and break down the ingredients. Analyze this ${mealType} image and provide a comprehensive nutrition breakdown for each food item you can identify. Estimate realistic portion sizes based on both the visual cues in the image and the user's description.`;
      }
      
      userPrompt += `

Output structured JSON in this format:
{
  "meal_title": "A descriptive title for this meal",
  "food_items": [
    { 
      "name": "Food 1", 
      "portion": "Portion size with weight", 
      "calories": number, 
      "protein_g": number, 
      "carbs_g": number, 
      "fat_g": number 
    },
    { 
      "name": "Food 2", 
      "portion": "Portion size with weight", 
      "calories": number, 
      "protein_g": number, 
      "carbs_g": number, 
      "fat_g": number 
    }
  ],
  "total": {
    "calories": number,
    "protein_g": number,
    "carbs_g": number,
    "fat_g": number
  }
}

Return only the JSON in your response. No explanations or extra formatting.`;
      
      // Step 2: Call Supabase Edge Function to process the image
      console.log("Calling analyze-meal-photo function with data:", {
        imageUrl,
        userId,
        mealType,
        userPrompt,
        mealDescription: mealDescription.trim() || null
      });
      
      const { data, error } = await supabase.functions.invoke('analyze-meal-photo', {
        body: {
          imageUrl,
          userId,
          mealType,
          userPrompt,
          mealDescription: mealDescription.trim() || null
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
    setMealDescription("");
  };

  return (
    <>
      <AnimatedCard className="relative overflow-hidden bg-white/80 backdrop-blur-md border border-gray-200/60 shadow-sm">
        <div className="flex flex-col items-center justify-center p-3">
          {imagePreview ? (
            <div className="relative w-full max-w-[120px] mx-auto mb-3">
              <img 
                src={imagePreview} 
                alt="Meal preview" 
                className="w-full h-auto rounded-lg object-cover"
              />
              <button
                onClick={handleRemoveImage}
                className="absolute -top-1 -right-1 bg-gray-900/80 text-white p-1 rounded-full hover:bg-gray-900 transition-colors"
              >
                <X size={12} />
              </button>
            </div>
          ) : (
            <div className="flex flex-row gap-2 mb-3">
              <button
                onClick={openCamera}
                className={cn(
                  "relative rounded-full p-3 transition-all duration-200 bg-gradient-to-b from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 shadow-sm border border-gray-300/40 active:scale-95",
                  isCapturing && "bg-gradient-to-b from-hashim-500 to-hashim-600"
                )}
              >
                <Camera className={cn("text-gray-700", isCapturing && "text-white")} size={18} />
              </button>
              
              <button
                onClick={handleSelectFile}
                className="relative rounded-full p-3 transition-all duration-200 bg-gradient-to-b from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 shadow-sm border border-gray-300/40 active:scale-95"
              >
                <Upload className="text-gray-700" size={18} />
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
            <h3 className="font-semibold text-sm mb-1 text-gray-900">
              {imagePreview ? (analysisResult ? "Analyzed" : "Ready") : "Snap Meal"}
            </h3>
            <p className="text-gray-600 text-xs leading-tight">
              {analysisResult 
                ? `Nutrition tracked`
                : imagePreview 
                  ? "Tap to analyze" 
                  : "Quick nutrition tracking"}
            </p>
            
            {imagePreview && !analysisResult && (
              <div className="space-y-3 w-full max-w-[140px] mx-auto mt-3">
                <div className="space-y-2">
                  <Select
                    value={mealType}
                    onValueChange={setMealType}
                    disabled={isProcessing}
                  >
                    <SelectTrigger className="w-full h-8 text-xs">
                      <SelectValue placeholder="Meal type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="breakfast">Breakfast</SelectItem>
                      <SelectItem value="lunch">Lunch</SelectItem>
                      <SelectItem value="dinner">Dinner</SelectItem>
                      <SelectItem value="snack">Snack</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Textarea
                    placeholder="Describe your meal (optional)"
                    value={mealDescription}
                    onChange={(e) => setMealDescription(e.target.value)}
                    disabled={isProcessing}
                    className="min-h-[60px] text-xs"
                  />
                </div>
                
                <Button 
                  className="w-full h-8 text-xs bg-gradient-to-b from-hashim-500 to-hashim-600 hover:from-hashim-600 hover:to-hashim-700 shadow-sm" 
                  onClick={processMealImage}
                  disabled={isProcessing}
                >
                  {isProcessing ? "Analyzing..." : "Analyze"}
                </Button>
              </div>
            )}
            
            {analysisResult && (
              <div className="space-y-4 w-full max-w-lg mx-auto mt-3">
                {/* Total Macros Summary */}
                <Card className="bg-gradient-to-r from-hashim-50 to-orange-50 border-hashim-200">
                  <CardContent className="p-3">
                    <h4 className="font-semibold text-hashim-800 mb-2 text-center text-sm">Total Macros</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-white/70 rounded-lg p-2 text-center">
                        <div className="text-lg font-bold text-hashim-600">{analysisResult.total.calories}</div>
                        <div className="text-xs text-gray-600">Calories</div>
                      </div>
                      <div className="bg-white/70 rounded-lg p-2 text-center">
                        <div className="text-lg font-bold text-blue-600">{analysisResult.total.protein_g}g</div>
                        <div className="text-xs text-gray-600">Protein</div>
                      </div>
                      <div className="bg-white/70 rounded-lg p-2 text-center">
                        <div className="text-lg font-bold text-green-600">{analysisResult.total.carbs_g}g</div>
                        <div className="text-xs text-gray-600">Carbs</div>
                      </div>
                      <div className="bg-white/70 rounded-lg p-2 text-center">
                        <div className="text-lg font-bold text-yellow-600">{analysisResult.total.fat_g}g</div>
                        <div className="text-xs text-gray-600">Fat</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Detected Foods */}
                <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                  <CardContent className="p-3">
                    <h4 className="font-semibold text-blue-800 mb-3 text-center text-sm">Detected Foods</h4>
                    <div className="space-y-2">
                      {analysisResult.food_items.map((item: any, index: number) => (
                        <div key={index} className="bg-white/80 rounded-lg p-2 border border-blue-100">
                          <div className="flex justify-between items-start mb-1">
                            <div>
                              <h5 className="font-medium text-gray-800 text-sm">{item.name}</h5>
                              <p className="text-xs text-gray-600">{item.portion}</p>
                            </div>
                            <div className="text-right">
                              <span className="text-sm font-bold text-hashim-600">{item.calories}</span>
                              <span className="text-xs text-gray-500 ml-1">cal</span>
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-1 text-center">
                            <div className="bg-blue-50 rounded px-1 py-1">
                              <div className="text-xs font-semibold text-blue-700">{item.protein_g}g</div>
                              <div className="text-[10px] text-blue-600">Protein</div>
                            </div>
                            <div className="bg-green-50 rounded px-1 py-1">
                              <div className="text-xs font-semibold text-green-700">{item.carbs_g}g</div>
                              <div className="text-[10px] text-green-600">Carbs</div>
                            </div>
                            <div className="bg-yellow-50 rounded px-1 py-1">
                              <div className="text-xs font-semibold text-yellow-700">{item.fat_g}g</div>
                              <div className="text-[10px] text-yellow-600">Fat</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                
                <Button 
                  className="w-full h-8 text-xs bg-gradient-to-b from-hashim-500 to-hashim-600 hover:from-hashim-600 hover:to-hashim-700 shadow-sm" 
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
