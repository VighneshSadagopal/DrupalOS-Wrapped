"use server"

import { collectAndStoreDrupalUserData } from "@/utils/drupal-api"

export async function getDrupalUserData(username: string) {
  const drupalData = await collectAndStoreDrupalUserData(username, 12)
  console.log("SERVER", drupalData)
  return drupalData
}