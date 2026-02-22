import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/ips/Header";
import Footer from "@/components/ips/Footer";
import HeroSection from "@/components/ips/HeroSection";
import ProgramsSection from "@/components/ips/ProgramsSection";
import NewsEventsSection from "@/components/ips/NewsEventsSection";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main>
        <Tabs defaultValue="home" className="w-full">
          <div className="sticky top-16 z-40 border-b border-border/40 bg-card/80 backdrop-blur-xl">
            <div className="container mx-auto px-4">
              <TabsList className="h-12 w-full justify-start gap-1 rounded-none bg-transparent p-0">
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
                  value="news"
                  className="rounded-xl data-[state=active]:bg-accent/10 data-[state=active]:text-accent data-[state=active]:shadow-none"
                >
                  Notícias & Eventos
                </TabsTrigger>
              </TabsList>
            </div>
          </div>

          <TabsContent value="home" className="mt-0">
            <HeroSection />
          </TabsContent>
          <TabsContent value="programs" className="mt-0">
            <ProgramsSection />
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
