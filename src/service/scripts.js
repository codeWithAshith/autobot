import fs from "fs";
import path from "path";

const scriptsFilePath = path.join(process.cwd(), "public/scripts/scripts.txt");

export const getScripts = () => {
  try {
    const fileContent = fs.readFileSync(scriptsFilePath, "utf-8");
    return fileContent ? JSON.parse(fileContent) : [];
  } catch (error) {
    console.error("Error reading scripts file:", error);
    return [];
  }
};

export const addScript = (newScript) => {
  try {
    const currentScripts = getScripts();
    currentScripts.push(newScript);

    fs.writeFileSync(
      scriptsFilePath,
      JSON.stringify(currentScripts, null, 2),
      "utf-8"
    );
    return currentScripts;
  } catch (error) {
    console.error("Error writing to scripts file:", error);
    return null;
  }
};

export const updateScript = (updatedScript) => {
  try {
    const currentScripts = getScripts();

    const updatedScripts = currentScripts.map((script) =>
      script.title === updatedScript.title ? updatedScript : script
    );

    fs.writeFileSync(
      scriptsFilePath,
      JSON.stringify(updatedScripts, null, 2),
      "utf-8"
    );

    return updatedScripts;
  } catch (error) {
    console.error("Error writing to scripts file:", error);
    return null;
  }
};

export const getScriptTitles = () => {
  const scripts = getScripts();
  return scripts.map((script) => script.title);
};

export const getScriptByTitle = (title) => {
  const scripts = getScripts();
  const foundScript = scripts.find((script) => script.title === title);

  if (!foundScript) {
    console.error(`Script with title "${title}" not found.`);
    return null;
  }

  return foundScript;
};

export const softDelete = async (title) => {
  console.log(title);

  try {
    const currentScripts = getScripts();

    const updatedScripts = currentScripts.map((script) => {
      if (script.title === title) {
        return { ...script, deleteFlag: true };
      }
      return script;
    });

    fs.writeFileSync(
      scriptsFilePath,
      JSON.stringify(updatedScripts, null, 2),
      "utf-8"
    );

    return updatedScripts;
  } catch (error) {
    console.error("Error updating scripts:", error);
  }
};

export const deleteScriptByTitle = (title) => {
  console.log(title);

  try {
    const currentScripts = getScripts();

    const updatedScripts = currentScripts.filter(
      (script) => script.title !== title
    );

    fs.writeFileSync(
      scriptsFilePath,
      JSON.stringify(updatedScripts, null, 2),
      "utf-8"
    );

    return updatedScripts;
  } catch (error) {
    console.error;
  }
};

export const getDescriptionDetail = () => {
  return `Welcome to my YouTube channel! Here, we share fascinating facts, insights, and stories on a wide variety of topics, all presented in a fun and engaging format through YouTube Shorts.

How the Content is Created: We use an application to automate parts of the content creation process, including the generation of facts and video creation with voiceovers. The videos are made with the help of technology that processes the facts, combines them with visuals, and adds a custom voiceover to create each short. These videos are then uploaded automatically to this channel as part of an experiment to see how well we can grow and engage an audience using this approach.

Our goal is to provide you with interesting and entertaining content while exploring how technology can assist in the creative process. All content is carefully reviewed to ensure its accuracy and relevance before being posted.

Why We’re Doing This: We’re testing new ways of content creation and audience building. By using this technology-driven approach, we're learning how automation can aid in creating engaging YouTube content while exploring what resonates with viewers.`;
};
