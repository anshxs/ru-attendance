"use client";

import React, { useState, useEffect } from "react";
import { getMessMenu, MessMenuResponse, getAuthToken } from "@/lib/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProtectedRoute } from "@/components/protected-route";
import { DashboardLayout } from "@/components/dashboard-layout";
import {
  Utensils,
  Clock,
  Calendar as CalendarIcon,
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Coffee,
  Sun,
  Moon,
  Cookie,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { MagicCard } from "@/components/ui/magic-card";

function MessMenuContent() {
  const [messMenu, setMessMenu] = useState<MessMenuResponse | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");

  const formatDateForAPI = (date: Date): string => {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const formatDateForDisplay = (date: Date): string => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const fetchMessMenu = async (date: Date) => {
    try {
      setIsLoading(true);
      setError("");
      const dateString = formatDateForAPI(date);
      const data = await getMessMenu(dateString);
      setMessMenu(data);
    } catch (err: any) {
      console.error("Failed to fetch mess menu:", err);
      setError(
        err.response?.data?.message || err.message || "Failed to load mess menu"
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMessMenu(selectedDate);
  }, [selectedDate]);

  const navigateDate = (direction: "prev" | "next") => {
    const newDate = new Date(selectedDate);
    if (direction === "next") {
      newDate.setDate(selectedDate.getDate() + 1);
    } else {
      newDate.setDate(selectedDate.getDate() - 1);
    }
    setSelectedDate(newDate);
  };

  const getMealIcon = (mealType: string) => {
    switch (mealType) {
      case "BREAKFAST":
        return <Sun className="h-5 w-5 text-yellow-800" />;
      case "LUNCH":
        return <Utensils className="h-5 w-5 text-orange-800" />;
      case "SNACKS":
        return <Cookie className="h-5 w-5 text-purple-800" />;
      case "DINNER":
        return <Moon className="h-5 w-5 text-blue-800" />;
      default:
        return <Utensils className="h-5 w-5 text-zinc-800" />;
    }
  };

  const getMealColor = (mealType: string) => {
    switch (mealType) {
      case "BREAKFAST":
        return "bg-yellow-800 text-white border-yellow-700";
      case "LUNCH":
        return "bg-orange-800 text-white border-orange-700";
      case "SNACKS":
        return "bg-purple-800 text-white border-purple-700";
      case "DINNER":
        return "bg-blue-800 text-white border-blue-700";
      default:
        return "bg-zinc-900 text-white border-zinc-700";
    }
  };

  const getCurrentMeal = () => {
    const now = new Date();
    const currentHour = now.getHours();

    if (currentHour >= 7 && currentHour < 10) {
      return "BREAKFAST";
    } else if (currentHour >= 12 && currentHour < 15) {
      return "LUNCH";
    } else if (currentHour >= 17 && currentHour < 18) {
      return "SNACKS";
    } else if (currentHour >= 19 && currentHour < 21) {
      return "DINNER";
    }
    return null;
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  if (error) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-black p-6">
          <div className="max-w-md mx-auto mt-10">
            <MagicCard className="p-1 rounded-2xl border-gray-200 border">
              <Card className="bg-black border-red-800">
                <CardContent className="pt-6">
                  <div className="text-center space-y-4">
                    <AlertCircle className="h-16 w-16 text-red-400 mx-auto" />
                    <div>
                      <h2 className="text-xl font-bold text-white mb-2">
                        Error Loading Menu
                      </h2>
                      <p className="text-red-400">{error}</p>
                    </div>
                    <Button
                      onClick={() => fetchMessMenu(selectedDate)}
                      variant="outline"
                      className="bg-black border-zinc-700 text-white hover:bg-zinc-900"
                    >
                      Try Again
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </MagicCard>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-white p-6 space-y-6">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-black mb-2">Mess Menu</h1>
              <p className="text-zinc-600">
                Daily meal schedule and menu items
              </p>
            </div>

            {isToday(selectedDate) && getCurrentMeal() && (
              <Badge className={getMealColor(getCurrentMeal()!)}>
                Current: {getCurrentMeal()}
              </Badge>
            )}
          </div>
        </div>

        {/* Date Navigation */}
        {/* <MagicCard className="p-1 rounded-2xl border-gray-200 border">
        <Card className="bg-[#f0f0f0]">
          <CardContent className="p-4"> */}
        <div className="flex items-center justify-between">
          <Button
            // variant="secondary"
            onClick={() => navigateDate("prev")}
            className="text-black"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>

          <div className="text-center space-y-2">
            <div className="flex items-center space-x-2 text-black">
              <CalendarIcon className="h-5 w-5" />
              <span className="text-lg font-semibold">
                {formatDateForDisplay(selectedDate)}
              </span>
            </div>
            {isToday(selectedDate) ? (
              <Badge className="bg-green-900 text-white border-green-700">
                Today
              </Badge>
            ) : (
              <Button
                // variant="outline"
                size="sm"
                onClick={() => setSelectedDate(new Date())}
                className="bg-[#ececec] border-zinc-700 text-black hover:bg-[#ececec] text-xs"
              >
                Go to Today
              </Button>
            )}
          </div>

          <Button
            // variant="ghost"
            onClick={() => navigateDate("next")}
            className="text-black"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        {/* </CardContent>
        </Card>
        </MagicCard> */}

        {/* Menu Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-white" />
          </div>
        ) : messMenu ? (
          <div className="space-y-6">
            {/* Meal Timings Overview */}
            {/* <MagicCard className="p-1 rounded-2xl border-gray-200 border">
            <Card className="bg-[#101010] border-zinc-800">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-white">
                  <Clock className="h-5 w-5" />
                  <span>Meal Timings</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(messMenu.timings).map(([meal, timing]) => {
                    if (meal === 'id' || meal === 'updatedAt' || meal === 'updatedBy') return null;
                    
                    const mealType = meal as keyof typeof messMenu.groupedMenu;
                    const isCurrentMeal = isToday(selectedDate) && getCurrentMeal() === mealType;
                    
                    return (
                      <div 
                        key={meal} 
                        className={`p-3 rounded-lg border ${
                          isCurrentMeal 
                            ? 'bg-black border-blue-600' 
                            : 'bg-[#090909]'
                        }`}
                      >
                        <div className="flex items-center space-x-2 mb-1">
                          {getMealIcon(mealType)}
                          <span className="font-medium text-white">{mealType}</span>
                        </div>
                        <p className="text-sm text-zinc-400">{timing}</p>
                        {isCurrentMeal && (
                          <Badge className="mt-2 bg-green-900 text-green-300 border-green-700 text-xs">
                            Now Serving
                          </Badge>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
            </MagicCard> */}

            {/* Meal Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {Object.entries(messMenu.groupedMenu).map(([mealType, items]) => {
                const isCurrentMeal =
                  isToday(selectedDate) && getCurrentMeal() === mealType;
                const timing =
                  messMenu.timings[mealType as keyof typeof messMenu.timings];

                return (
                  // <MagicCard className="p-2 rounded-2xl" key={mealType}>
                  <Card
                    key={mealType}
                    className={`bg-[#f0f0f0] shadow-none  ${
                      isCurrentMeal ? "ring-2 ring-blue-600" : ""
                    }`}
                  >
                    <CardHeader>
                      <CardTitle className="flex flex-col items-start gap-2 text-black">
                        <div className="flex items-center space-x-3">
                          {getMealIcon(mealType)}
                          <span>{mealType}</span>
                        </div>
                        <Badge className={getMealColor(mealType)}>
                          {timing}
                        </Badge>
                      </CardTitle>
                      {isCurrentMeal && (
                        <CardDescription className="text-green-400">
                          Currently being served
                        </CardDescription>
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* Menu Items */}
                        <div className="space-y-2">
                          {items.map((item, index) => (
                            <div
                              key={index}
                              className="flex items-center space-x-2 p-2 bg-white rounded-lg"
                            >
                              <div className="w-2 h-2 bg-zinc-600 rounded-full"></div>
                              <span className="text-black text-sm">{item}</span>
                            </div>
                          ))}

                          {items.length === 0 && (
                            <div className="text-center py-4">
                              <p className="text-zinc-500">
                                No items available
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  // </MagicCard>
                );
              })}
            </div>

            {/* Additional Info */}
            <MagicCard className="p-1 rounded-2xl border-gray-200 border">
              <Card className="bg-[#f0f0f0]">
                <CardContent className="pt-6">
                  <div className="text-center space-y-2">
                    <p className="text-sm text-zinc-700">
                      Menu updated on:{" "}
                      {new Date(
                        messMenu.timings.updatedAt
                      ).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-zinc-600">
                      (D) indicates dairy items
                    </p>
                  </div>
                </CardContent>
              </Card>
            </MagicCard>
          </div>
        ) : (
          <MagicCard className="p-1 rounded-2xl border-gray-200 border">
            <Card className="bg-black border-zinc-800">
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <Utensils className="h-16 w-16 text-zinc-400 mx-auto" />
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">
                      No Menu Available
                    </h3>
                    <p className="text-zinc-400">
                      No menu has been set for this date.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </MagicCard>
        )}
      </div>
    </DashboardLayout>
  );
}

export default function MessMenuPage() {
  return (
    <ProtectedRoute>
      <MessMenuContent />
    </ProtectedRoute>
  );
}
