import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
} from "react-native";
import React, { useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

export default function RecipesFormScreen({ route, navigation }) {
  const { recipeToEdit, recipeIndex, onrecipeEdited } = route.params || {};
  const [title, setTitle] = useState(recipeToEdit ? recipeToEdit.title : "");
  const [image, setImage] = useState(recipeToEdit ? recipeToEdit.image : "");
  const [description, setDescription] = useState(
    recipeToEdit ? recipeToEdit.description : ""
  );
  const [ingredients, setIngredients] = useState(
    recipeToEdit && recipeToEdit.ingredients
      ? Array.isArray(recipeToEdit.ingredients)
        ? recipeToEdit.ingredients
            .map(
              ing =>
                `${ing.ingredientName || ing.name || ing} - ${
                  ing.measure || ""
                }`
            )
            .join("\n")
        : recipeToEdit.ingredients
      : ""
  );
  const [instructions, setInstructions] = useState(
    recipeToEdit
      ? recipeToEdit.instructions || recipeToEdit.recipeInstructions || ""
      : ""
  );

  const saverecipe = async () => {
    try {
      // Parse ingredients from text input
      const ingredientsList = ingredients
        ? ingredients
            .split("\n")
            .filter(line => line.trim())
            .map(line => {
              const parts = line.split(" - ");
              return {
                ingredientName: parts[0]?.trim() || line.trim(),
                measure: parts[1]?.trim() || "",
              };
            })
        : [];

      // Initialize a new recipe object
      const newRecipe = {
        title: title,
        image: image,
        description: description,
        ingredients: ingredientsList,
        instructions: instructions,
      };

      // Retrieve existing recipes from AsyncStorage
      const existingRecipesJson = await AsyncStorage.getItem("customrecipes");
      let recipes = existingRecipesJson ? JSON.parse(existingRecipesJson) : [];

      if (recipeToEdit) {
        // If editing an existing recipe, update it at the specified index
        if (recipeIndex !== undefined && recipeIndex >= 0) {
          recipes[recipeIndex] = newRecipe;
        }
        // Save the updated array back to storage
        await AsyncStorage.setItem("customrecipes", JSON.stringify(recipes));
        // Call the callback to notify parent component about the edit
        if (onrecipeEdited) {
          onrecipeEdited();
        }
      } else {
        // If adding a new recipe, push it to the array
        recipes.push(newRecipe);
        // Save the updated array back to storage
        await AsyncStorage.setItem("customrecipes", JSON.stringify(recipes));
      }

      // Ensure data is saved before navigating back
      // Wait a moment to ensure AsyncStorage write is complete
      await new Promise(resolve => setTimeout(resolve, 50));

      // Navigate back to the previous screen
      navigation.goBack();
    } catch (error) {
      console.error("Error saving recipe:", error);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}>
      <TextInput
        placeholder="Title"
        value={title}
        onChangeText={setTitle}
        style={styles.input}
      />
      <TextInput
        placeholder="Image URL"
        value={image}
        onChangeText={setImage}
        style={styles.input}
      />
      {image ? (
        <Image source={{ uri: image }} style={styles.image} />
      ) : (
        <Text style={styles.imagePlaceholder}>Upload Image URL</Text>
      )}
      <TextInput
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
        multiline={true}
        numberOfLines={4}
        style={[styles.input, { height: hp(15), textAlignVertical: "top" }]}
      />
      <Text style={styles.label}>
        Ingredients (one per line, format: Name - Measure)
      </Text>
      <TextInput
        placeholder="e.g., Flour - 2 cups&#10;Sugar - 1 cup&#10;Eggs - 2 pieces"
        value={ingredients}
        onChangeText={setIngredients}
        multiline={true}
        numberOfLines={6}
        style={[styles.input, { height: hp(15), textAlignVertical: "top" }]}
      />
      <Text style={styles.label}>Step-by-step Instructions</Text>
      <TextInput
        placeholder="Enter step-by-step instructions..."
        value={instructions}
        onChangeText={setInstructions}
        multiline={true}
        numberOfLines={8}
        style={[styles.input, { height: hp(20), textAlignVertical: "top" }]}
      />
      <TouchableOpacity onPress={saverecipe} style={styles.saveButton}>
        <Text style={styles.saveButtonText}>Save recipe</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: wp(4),
    paddingBottom: hp(4),
  },
  input: {
    marginTop: hp(1),
    borderWidth: 1,
    borderColor: "#ddd",
    padding: wp(2),
    marginVertical: hp(1),
    borderRadius: 5,
  },
  label: {
    fontSize: hp(1.8),
    fontWeight: "600",
    color: "#4B5563",
    marginTop: hp(2),
    marginBottom: hp(0.5),
  },
  image: {
    width: 300,
    height: 200,
    margin: wp(2),
  },
  imagePlaceholder: {
    height: hp(20),
    justifyContent: "center",
    alignItems: "center",
    marginVertical: hp(1),
    borderWidth: 1,
    borderColor: "#ddd",
    textAlign: "center",
    padding: wp(2),
  },
  saveButton: {
    backgroundColor: "#4F75FF",
    padding: wp(0.5),
    alignItems: "center",
    borderRadius: 5,
    marginTop: hp(2),
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
