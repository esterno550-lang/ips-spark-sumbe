import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/ips/Header";
import Footer from "@/components/ips/Footer";
import HeroSection from "@/components/ips/HeroSection";
import ProgramsSection from "@/components/ips/ProgramsSection";
import NewsEventsSection from "@/components/ips/NewsEventsSection";
import VisitSection from "@/components/ips/VisitSection";

const Index = () => {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") || "home";
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab) setActiveTab(tab);
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="sticky top-16 z-40 border-b border-border/40 bg-card/80 backdrop-blur-xl">
            <div className="container mx-auto px-4">
              <TabsList className="h-12 w-full justify-start gap-1 rounded-none bg-transparent p-0 overflow-x-auto">
                <TabsTrigger
                  value="home"
                  className="rounded-xl data-[state=active]:bg-accent/10 data-[state=active]:text-accent data-[state=active]:shadow-none"
                >
                  Início
                </TabsTrigger>
                <TabsTrigger
                  value="programs"
                  className="rounded-xl data-[state=active]:bg-accent/10 data-[state=active]:text-accent data-[state=active]:shadow-none"
                >
                  Programas
                </TabsTrigger>
                <TabsTrigger
                  value="visit"
                  className="rounded-xl data-[state=active]:bg-accent/10 data-[state=active]:text-accent data-[state=active]:shadow-none"
                >
                  Visitas
                </TabsTrigger>
                <TabsTrigger
                  value="news"
                  className="rounded-xl data-[state=active]:bg-accent/10 data-[state=active]:text-accent data-[state=active]:shadow-none"
                >
                  Notícias
                </TabsTrigger>
              </TabsList>
            </div>
          </div>

          <TabsContent value="home" className="mt-0">
            <HeroSection onNavigate={setActiveTab} />
          </TabsContent>
          <TabsContent value="programs" className="mt-0">
            <ProgramsSection />
          </TabsContent>
          <TabsContent value="visit" className="mt-0">
            <VisitSection />
          </TabsContent>
          <TabsContent value="news" className="mt-0">
            <NewsEventsSection />
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
