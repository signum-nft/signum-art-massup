import { promptPinning, promptProfile } from "./prompt";
import { verifyProfile } from "./verifyProfile";
import { hasProfileData } from "./hasProfileData";
import { promptConfirm } from "@lib/promptConfirm";
import { ProfileData } from "@lib/profileData";

export const init = async () => {
  const hasProfile = await hasProfileData();
  if (hasProfile) {
    const overwrite = await promptConfirm(
      "Do you want to overwrite the existing profile?"
    );
    if (!overwrite) {
      console.info("Canceled by User");
      return;
    }
  }

  const profileAnswers = await promptProfile();
  const verifiedProfile = await verifyProfile(
    profileAnswers.network,
    profileAnswers.seed
  );
  const pinningAnswers = await promptPinning();

  // TODO: verify pinning services

  const profileData = new ProfileData();
  profileData.seed = profileAnswers.seed;
  profileData.network = profileAnswers.network;
  profileData.pinningService = pinningAnswers.pinningService;
  profileData.pinningKey = pinningAnswers.pinningKey;
  profileData.address = verifiedProfile.address.getReedSolomonAddress();
  profileData.name = verifiedProfile.name;
  profileData.description = verifiedProfile.description;

  profileData.print();
  const confirmed = await promptConfirm("Is this correct?");
  if (!confirmed) {
    console.info("Canceled by User");
    return;
  }
  await profileData.save(profileAnswers.pin);

  console.info("Profile successfully initialized");
};
