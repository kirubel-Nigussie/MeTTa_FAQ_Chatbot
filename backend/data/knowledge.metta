; --- MeTTa Knowledge Base ---
; This expanded version covers more core atom types, functions, and advanced syntax.

; --- 1. CORE CONCEPTS (Atom Types) ---
(Concept "Atom")
(Description "Atom" "An Atom is the fundamental unit of data in MeTTa. Everything is an Atom, including symbols, expressions, and variables.")
(Type "Atom" "Core Concept")

(Concept "Symbol")
(Description "Symbol" "A Symbol is a basic atom representing a name or identifier, like 'Alice' or 'Friend'. Symbols are often used as function names or entity identifiers.")
(Type "Symbol" "Atom Type")

(Concept "Expression")
(Description "Expression" "An Expression is a tuple of atoms enclosed in parentheses, like '(Friend Alice Bob)'. It represents a relation, function call, or a piece of structured data.")
(Type "Expression" "Atom Type")

(Concept "Variable")
(Description "Variable" "A Variable is an atom starting with '$', like '$x'. It is used for pattern matching and substitution during unification and evaluation.")
(Type "Variable" "Atom Type")

(Concept "GroundedAtom")
(Description "GroundedAtom" "A Grounded Atom wraps an external, executable entity (like a Python function or a numeric value) into the AtomSpace, allowing MeTTa to interface with external systems.")
(Type "GroundedAtom" "Atom Type")

(Concept "TypeAtom")
(Description "TypeAtom" "A TypeAtom represents a type signature for other atoms or expressions. They are used in definitions like '(Type Human Symbol)'.")
(Type "TypeAtom" "Atom Type")

(Concept "Space")
(Description "Space" "A Space is a container for Atoms, often referred to as the AtomSpace. '&self' refers to the current working space.")


; --- 2. CORE FUNCTIONS AND SYNTAX ---

(Concept "match")
(Description "match" "The 'match' function attempts to find all atoms in the AtomSpace that match a given pattern. It returns a result based on a template for each successful match.")
(Syntax "match" "(match <space> <pattern> <template>)")
(Example "match" "(match &self (Friend Alice $x) $x)")

(Concept "unify")
(Description "unify" "The 'unify' function attempts to unify two atoms (atom1 and atom2). If successful, it applies the resulting substitution to a 'then' expression; otherwise, it returns the result of the 'else' expression.")
(Syntax "unify" "(unify <atom1> <atom2> <then> <else>)")
(Example "unify" "(unify (A B $x) (A $y C) (Result $x $y) Empty)")

(Concept "superpose")
(Description "superpose" "The 'superpose' function evaluates multiple expressions and combines their results into a single collection, allowing for complex, multi-source queries.")
(Syntax "superpose" "(superpose <expr1> <expr2> ...)")
(Example "superpose" "(superpose (match &self (A $x) $x) (match &self (B $y) $y))")

(Concept "let")
(Description "let" "The 'let' function introduces a local variable binding within a scope. It is primarily used to assign the result of an evaluation to a variable before using it in subsequent expressions.")
(Syntax "let" "(let <variable> <value> <expression>)")
(Example "let" "(let $result (sum 1 2) (print-result $result))")

(Concept "cons")
(Description "cons" "A fundamental list-building function (Constructor). It takes an element (head) and a list (tail) and returns a new list with the element prepended.")
(Syntax "cons" "(cons <head> <tail-list>)")
(Example "cons" "(cons 1 (List 2 3)) ; Results in (List 1 2 3)")

; --- 3. CORE HIERARCHY AND USAGE CONTEXTS ---

; Atom Hierarchy: What Atom is composed of
(Related "Atom" "Symbol")
(Related "Atom" "Expression")
(Related "Atom" "Variable")
(Related "Atom" "GroundedAtom")
(Related "Atom" "TypeAtom")

; Function Abstraction: What is the primary purpose of the function
(Related "match" "Space") ; Match queries the AtomSpace
(Related "unify" "Pattern Matching")
(Related "superpose" "Query Aggregation")
(Related "let" "Scope")

; Atom Types and Use Cases
(Related "GroundedAtom" "External Code")
(Related "Expression" "Function Call")
(Related "Expression" "Relationship")


; --- 4. FUNCTIONAL DEPENDENCIES (Inverse Relationships) ---
; What core concepts are essential inputs or outputs for these functions?

(Related "Variable" "match")      ; match relies on variables for patterns
(Related "Variable" "unify")      ; unify relies on variables for substitution
(Related "Expression" "match")    ; match returns results as Expressions
(Related "Expression" "unify")    ; unify executes a 'then' Expression
(Related "Expression" "cons")     ; cons returns a new Expression (list)
(Related "Variable" "let")        ; let requires a variable for binding
