import inquirer from "inquirer";

export interface CollectionPullAnswers {
  collectionId: string;
}

export const prompt = async () => {
  return inquirer.prompt<CollectionPullAnswers>([
    {
      type: "input",
      message: "Enter the Collection Id you want to continue:",
      name: "collectionId",
    },
  ]);
};
