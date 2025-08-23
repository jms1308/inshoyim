
import { getAchievements } from "@/lib/services/achievements";
import { AchievementCard } from "@/components/AchievementCard";

export const dynamic = 'force-dynamic';

export default async function AchievementsPage() {
    const achievements = await getAchievements();

    return (
        <div className="container mx-auto px-4 py-8 md:py-12">
            <section className="text-center animate-fade-in-up">
                <h1 className="font-headline text-4xl md:text-5xl font-bold">
                    Yutuqlar Doskasi
                </h1>
                <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                    Platformamizning eng faol va eng yaxshi foydalanuvchilari bilan tanishing.
                </p>
            </section>

            <section className="mt-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {achievements.map((achievement, index) => (
                         <div 
                            key={achievement.id} 
                            className="animate-fade-in-up" 
                            style={{ animationDelay: `${index * 100}ms`}}
                        >
                            <AchievementCard achievement={achievement} />
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
