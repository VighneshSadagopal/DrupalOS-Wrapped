import { getDrupalUserData } from "@/app/actions";
import StoryExperience from "@/components/StoryExperience";
import { notFound } from "next/navigation";
import { Metadata } from "next";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;

  return {
    title: `${slug}'s Drupal 2025 Wrapped`,
    description: `Check out ${slug}'s contributions to the Drupal ecosystem in 2025!`,
  };
}

export default async function UserPage({ params }: PageProps) {
  const { slug } = await params;

  // 1. Fetch Drupal user data
  const drupalData = await getDrupalUserData(slug);

  if (!drupalData) {
    notFound();
  }

  return (
    <StoryExperience
      theme="muted"
      year={2025}
      slugUserData={drupalData}
    />
  );
}
