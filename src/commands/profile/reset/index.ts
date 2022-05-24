import { ProfileData } from "@lib/profileData";
import { promptConfirm } from "@lib/promptConfirm";

export const reset = async () => {
  const exists = await ProfileData.exists();
  if (!exists) {
    console.info("No profile found");
    return;
  }

  const confirmed = await promptConfirm(
    "Do you really want to remove the profile?"
  );

  if (confirmed) {
    await ProfileData.reset();
    console.info("Profile removed from this machine");
  }
};
