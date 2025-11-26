from hyperon import MeTTa

class MettaService:
    def __init__(self, knowledge_path):
        self.metta = MeTTa()
        try:
            # safe_path = knowledge_path.replace("\\", "/")
            # Use import! to load the file into the AtomSpace
            # self.metta.run(f'!(import! &self "{safe_path}")')
            
            # FIX: Load file content directly to bypass module loader strictness
            print(f"Debug: Loading MeTTa file content from: {knowledge_path}")
            with open(knowledge_path, 'r') as f:
                content = f.read()
            self.metta.run(content)
            print(f"Loaded MeTTa file content from: {knowledge_path}")
            
            # --- Define MeTTa Reasoning Function for Inference ---
            # Define a transitive relation: (Is_A $x $y) means $x$ is related to $y$
            # Base Case: Direct relationship (A is related to B)
            self.metta.run('!(:: (Is_A $x $y) (match &self (Related $x $y) True))')
            # Transitive Step: If A is related to B, and B is related to C, then A is related to C. (Not strictly needed for this simple graph, but shows inference capability)
            # self.metta.run('!(:: (Is_A $x $z) (match &self (Related $x $y) (match &self (Is_A $y $z) True)))')
            
            print("Debug: Initialized MeTTa Reasoning functions.")
            
        except Exception as e:
            print(f"Error loading MeTTa file or defining rules: {e}")

    def _normalize_concept(self, concept_name):
        """Normalizes common concepts to ensure capitalization matches facts."""
        if concept_name is None:
            return None
        
        # Simple manual normalization for the primary concepts
        if concept_name.lower() == "atom":
            return "Atom"
        if concept_name.lower() == "symbol":
            return "Symbol"
        if concept_name.lower() == "expression":
            return "Expression"
        if concept_name.lower() == "variable":
            return "Variable"
        # Lowercase functions are assumed to be consistent (match, unify)
        return concept_name

    def search_concept(self, concept_name):
        """
        Searches for Description, Syntax, and Related concepts, and infers relationships.
        """
        concept_name = self._normalize_concept(concept_name)
        if concept_name is None:
            return None
            
        print(f"Debug: Normalized search for concept '{concept_name}'")

        # --- 1. Get Description, Syntax, Example ---
        results = {}
        for fact_type in ["Description", "Syntax", "Example"]:
            query = f'!(match &self ({fact_type} "{concept_name}" $val) $val)'
            result = self.metta.run(query)
            # Safely extract the string value, defaulting to a placeholder
            val = "Not found"
            if result and len(result) > 0 and len(result[0]) > 0:
                val = str(result[0][0])
            results[fact_type.lower()] = val

        # --- 2. Get Direct Related Concepts ---
        query_rel = f'!(match &self (Related "{concept_name}" $related) $related)'
        result_rel = self.metta.run(query_rel)
        related = [str(item) for item in result_rel[0] if result_rel and result_rel[0]]

        # --- 3. Graph Inference: What is this concept a part of? (Inverse Related) ---
        # Find $parent where (Related $parent concept_name)
        query_parent = f'!(match &self (Related $parent "{concept_name}") $parent)'
        result_parent = self.metta.run(query_parent)
        
        inferred_relations = []
        if result_parent and result_parent[0]:
            for parent in result_parent[0]:
                inferred_relations.append(f"Is a type of {str(parent)}")
        
        # If the concept is a function (e.g., match), also find what it relates to
        if not inferred_relations:
            query_relation_target = f'!(match &self (Related "{concept_name}" $target) $target)'
            result_target = self.metta.run(query_relation_target)
            if result_target and result_target[0]:
                for target in result_target[0]:
                    inferred_relations.append(f"Is typically used with {str(target)}")

        print(f"Debug: Inferred relations: {inferred_relations}")

        return {
            "concept": concept_name,
            "description": results["description"],
            "syntax": results["syntax"],
            "example": results["example"], # Added for completeness
            "related": related,
            "inferred_relations": inferred_relations
        }
