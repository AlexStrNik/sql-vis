start = tables:(w create_table w ";" w)* {
	return tables.map(t => t[1]);
}

create_table "CREATE TABLE"	= 
	CREATE w1 TABLE w1 name:identifier lparenw modifiers:table_modifier_seq rparenw {
		return { 
        	name,
            columns: modifiers
                .filter(c => c.__type == "column_definition"),
            constraints: modifiers
                .filter(c => c.__type == "table_constraint")
		}
	}
    
column_type "column type" = 
    VARCHAR lparenw size:integer rparenw {
    	return "VARCHAR(" + size + ")"
    } /
    DECIMAL lparenw a:integer comma b:integer rparenw {
    	return "DECIMAL(" + a + "," + b + ")"
    } /
    TEXT /
    INT /
    DATETIME /
	DATE
    
column_modifier "column modifier" = 
	NOT w1 NULL {
    	return "NOT_NULL"
    } /
    AUTO w1 INCREMENT {
    	return "AUTO_INCREMENT"
    }
    
identifier_seq = head:identifier tail:(comma i:identifier w { return i })* {
	return [head, ...tail]
}
    
table_constraint "table constraint" = 
	PRIMARY w1 KEY lparenw columns:identifier_seq rparenw {
    	return { 
        	__type: "table_constraint",
        	type: "PRIMARY_KEY",
            columns: columns
		}
    } /
    FOREIGN w1 KEY lparenw selfColumn:identifier w rparen w1 REFERENCES w1 foreignTable:identifier lparenw foreignColumn:identifier rparenw mandatory:(w1 MANDATORY)? {
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
	name:identifier w1 type:column_type modifiers:(w column_modifier w)* {
    	return {
        	__type: "column_definition",
        	name,
            type,
            modifiers: modifiers.map(m => m[1])
		}
    }
    
table_modifier = column_definition / table_constraint

table_modifier_seq = head:table_modifier tail:(comma i:table_modifier { return i })* comma? {
	return [head, ...tail]
}
   
identifier "identifier"	= 
	[A-Za-z0-9_]+ { return text(); }

integer "integer" = 
	[0-9]+ { return text(); }
 
w1 "whitespace" = 
	[ \t\n\r]+
w "whitespace" = 
	[ \t\n\r]*

CREATE "create" = 
	"CREATE" / "create"

TABLE "table" =
	"TABLE" / "table"

VARCHAR "varchar" =
	"VARCHAR" / "varchar"

DECIMAL "decimal" =
	"DECIMAL" / "decimal"

TEXT "text" = 
	"TEXT" / "text"

INT "int" = 
	"INT" / "int"

DATETIME "datetime" = 
	"DATETIME" / "datetime"

DATE "date" = 
	"DATE" / "date"

NOT "not" = 
	"NOT" / "not"

NULL "null" = 
	"NULL" / "null"

AUTO "auto" = 
	"AUTO" / "auto"

INCREMENT "increment" = 
	"INCREMENT" / "increment"

PRIMARY "primary" = 
	"PRIMARY" / "primary"

FOREIGN "foreign" =
	"FOREIGN" / "foreign"

KEY "key" = 
	"KEY" / "key"

REFERENCES "references" = 
	"REFERENCES" / "references"

MANDATORY "mandatory" = 
	"MANDATORY" / "mandatory"

lparen "left parentheses" = 
	"("

lparenw "left parentheses" = 
	w lparen w

rparen "right parentheses" = 
	")"

rparenw "right parentheses" = 
	w rparen w

comma "comma" =
	w "," w