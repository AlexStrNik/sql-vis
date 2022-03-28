start = tables:(_ create_table _ ";" _)* {
	return tables.map(t => t[1]);
}

create_table "CREATE TABLE"	= 
	"CREATE"__"TABLE" __ name:identifier _ "(" _ modifiers:table_modifier_seq ")" {
		return { 
        	name,
            columns: modifiers
                .filter(c => c.__type == "column_definition"),
            constraints: modifiers
                .filter(c => c.__type == "table_constraint")
		}
	}
    
column_type "column type" = 
    "VARCHAR"_"(" size:([0-9]+) _")" {
    	return "VARCHAR(" + size.join("") + ")"
    } /
    "DECIMAL"_"("_ a:([0-9]+) _","_ b:([0-9]+) _")" {
    	return "DECIMAL(" + a.join("") + "," + b.join("") + ")"
    } /
    "TEXT" /
    "INT" /
    "DATETIME"
    
column_modifier "column modifier" = 
	"NOT"__"NULL" {
    	return "NOT_NULL"
    } /
    "AUTO"__"INCREMENT" {
    	return "AUTO_INCREMENT"
    }
    
identifier_seq = head:identifier tail:("," _ i:identifier _ { return i })* {
	return [head, ...tail]
}
    
table_constraint "table constraint" = 
	"PRIMARY"__"KEY" _ "(" columns:identifier_seq ")" {
    	return { 
        	__type: "table_constraint",
        	type: "PRIMARY_KEY",
            columns: columns
		}
    } /
    "FOREIGN"__"KEY"_"(" selfColumn:identifier _")"__"REFERENCES"__ foreignTable:identifier _ "(" _ foreignColumn:identifier _ ")" mandatory:(__"MANDATORY")? {
    	return {
        	__type: "table_constraint",
        	type: "FOREIGN_KEY",
            selfColumn,
            foreignTable,
            foreignColumn,
            foreignMandatory: mandatory !== null,
        }
    }
   

column_definition "column definition" = 
	name:identifier __ type:column_type modifiers:(_ column_modifier _)* {
    	return {
        	__type: "column_definition",
        	name,
            type,
            modifiers: modifiers.map(m => m[1])
		}
    }
    
table_modifier = column_definition / table_constraint

table_modifier_seq = head:table_modifier tail:("," _ i:table_modifier _ { return i })* {
	return [head, ...tail]
}
   
identifier "identifier"	= 
	[A-Za-z0-9_]+ { return text(); }
 
__ "whitespace" = 
	[ \t\n\r]+
_ "whitespace" = 
	[ \t\n\r]*
