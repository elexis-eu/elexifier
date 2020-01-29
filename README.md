# Elexifier

<!-- vscode-markdown-toc -->
* 1. [Infrastructure](#Infrastructure)
* 2. [Use](#Use)
* 3. [XML transformation - basic concepts](#XMLtransformation-basicconcepts)
	* 3.1. [Selector descriptions](#Selectordescriptions)
	* 3.2. [Transformer descriptions](#Transformerdescriptions)
* 4. [PDF transformation - basic concepts](#PDFtransformation-basicconcepts)
* 5. [Local installation](#Localinstallation)
	* 5.1. [Building image](#Buildingimage)
	* 5.2. [Starting container](#Startingcontainer)
	* 5.3. [Database migration](#Databasemigration)

<!-- vscode-markdown-toc-config
	numbering=true
	autoSave=true
	/vscode-markdown-toc-config -->
<!-- /vscode-markdown-toc -->



Elexifier ([elexifier.elex.is](elexifier.elex.is)) is a cloud-based dictionary conversion service for conversion of legacy XML and PDF dictionaries into a shared data format based on the Elexis Data Model. It takes as input an XML or PDF dictionary and produces a TEI-compliant XML file in line with the specifications described in the Elexis Data Model.

##  1. <a name='Infrastructure'></a>Infrastructure

The application consists of two Docker containers:

- Frontend: https://github.com/elexis-eu/elexifier
- Backend: https://github.com/elexis-eu/elexifier-api

The frontend is written in Angular. The backend is written in Python Flask and uses a Postgres database. If you want to install it locally, check #local-installation.

##  2. <a name='Use'></a>Use

On the login screen, create a new account or login with your Sketch Engine credentials. Then select the XML or PDF module and upload a dictionary to get started. For detailed instructions, check the User Guide.

##  3. <a name='XMLtransformation-basicconcepts'></a>XML transformation - basic concepts

To transform a custom XML dictionary into an Elexis Data Model compliant format, you need to define a transformation, which specifies rules for transforming custom XML elements into Elexis Data model core elements. The script `https://github.com/elexis-eu/elexifier-api/blob/master/app/transformator/dictTransformations3.py` takes as input a JSON object with the following members:

- `entry` — describes the selector for entry elements
- `entry_lang` — describes the transformer for the language attribute of the entries
- `sense` — describes the selector for sense elements
- `hw` — describes the transformer for headwords
- `sec_hw` — describes the transformer for secondary headwords
- `pos` — describes the transformer for part-of-speech tags
- `hw_tr` — describes the transformer for translations of headwords
- `hw_tr_lang` — describes the transformer for the language of the translations of headwords
- `ex` — describes the transformer for examples
- `ex_tr` — describes the transformer for translations of examples
- `ex_tr_lang` — describes the transformer for the language of the translations of examples
- `def` — describes the transformer for definitions

###  3.1. <a name='Selectordescriptions'></a>Selector descriptions

A **selector** is a rule that selects 0 or more elements in the input XML tree.

The description of a selector must be a JSON object. This object must contain an attribute named type, whose value specifies the type the selector, plus one or more other attributes whose name and meaning depends on the selector type.

The following types of selectors are currently supported:

- *Xpath selector*: selects the nodes that match a given xpath expression (given in an attribute named expr). Example:

    ```{"type": "xpath", "expr": ".//example/text"}```
- *Union selector*: combines the results of several selectors (whose descriptions must be given as a JSON array in an attribute named selectors). Example:

    ```{"type": "union", "selectors": [...]}```
- *Exclude selector*: takes two selectors, left and right, and selects all those nodes which were selected by left but not by right. Example:

    ```{"type": "exclude", "left": {...}, "right": {...}}```

###  3.2. <a name='Transformerdescriptions'></a>Transformer descriptions

A **transformer** is a rule that describes which data from the input document must be transformed into a certain type of element in the output document.

The description of a transformer must be a JSON object. This object must contain an attribute named type, whose value specifies the type the transformer, plus one or more other attributes whose name and meaning depends on the transformer type.

The following types of transformers are currently supported:

**(1) Simple transformers**

A simple transformer selects a set of elements and extracts an attribute or the inner text from these elements; optionally applies a regular expression to the resulting text and returns the substring matched by a specific group within the regular expression.

The JSON object that describes a simple transformer must contain the following attributes:

- `type`: this must be the string "`simple`".
- `selector`: a JSON object describing a `selector`.
- `attr`: the name of an attribute (from the elements selected by the selector) whose value is to be extracted.
    - To extract the inner text of the element, instead of an attribute, use the pseudo-attribute name "`{http://elex.is/wp1/teiLex0Mapper/meta}innerText`".
    - To extract the inner text of the element and all of its descendants, use "`{http://elex.is/wp1/teiLex0Mapper/meta}innerTextRec`".
    - To return a constant value instead of extracting the value of an attribute, use the pseudo-attribute name "`{http://elex.is/wp1/teiLex0Mapper/meta}constant`".
- `rex`: a regular expression that is applied to the value of the attribute attr. If this string does not contain any match for this regular expression, the current element is not transformed (i.e. it is as if it hadn't been selected by the selector at all). If there are several matches, the first one is used. This attribute is optional. If present, it must use the [Python regular expression syntax](https://docs.python.org/3/library/re.html#regular-expression-syntax).
- `rexGroup`: this attribute is optional. If present, it must be the name of one of the named groups (`?P<name>...`) from the regular expression given by the attribute rex. In this case, only the string that matched this named group will be used, rather than the entire value of the attribute attr.
- `const`: this attribute should be present it attr was set to "`{http://elex.is/wp1/teiLex0Mapper/meta}constant`", and should provide the constant value that you want to return as the result of the transformation.
- `xlat`: this attribute is optional. If present, it should be a hash table that will be used to transform the string obtained from the previous steps (attribute lookup, regex matching). In other words, the string *s* will be replaced by `xlat`[s] if s appears as a key in `xlat` (otherwise, *s* will remain unchanged, just as if `xlat` had not been provided at all).

A simple example:

```javascript
{ "type": "simple",
"selector": {"type": "xpath", "expr": ".//ExampleCtn//Locale"},
"attr": "lang" }
```

A more complex example:

```javascript
{ "type": "simple",
"selector": {"type": "xpath", "expr": ".//sense/seg[1][@type='beleg']"},
"attr": "{http://elex.is/wp1/teiLex0Mapper/meta}innerTextRec"
"rex": "'(?P<insideQuotes>[^']*)'",
"rexGroup: "insideQuotes" }
```
This transformer selects the first <seg> in each <sense>, builds the inner text and extracts the first substring delimited by single quote marks.

An example of a constant-output transformer (i.e. to assign language codes to XML elements):

```javascript
{ "type": "simple",
  "selector": {"type: "xpath", "expr": ".//type"},
  "attr": "{http://elex.is/wp1/teiLex0Mapper/meta}constant",
  "const": "en" }
```

**(2) Union transformers**

A union transformer takes a set of simple transformers and performs all of their transformations. This might be useful if you need to combine several different transformation rules, e.g. extract attribute `@a` from instances of the element `<b>` and also extract attribute `@c` from instances of the element `<d>`.

The JSON object that describes a union transformer must contain the following attributes:

- `type`: this must be the string "`union`".
- `transformers`: an array of JSON objects describing the transformers that are to be combined.

##  4. <a name='PDFtransformation-basicconcepts'></a>PDF transformation - basic concepts

To transform a PDF dictionary, you need to annotate a sample of the PDF file. The PDF is first transformed in flat structure using a pdf2xml (Matjaž?) conversion script. Then, the a chunk of the resulting XML file is sent to Lexonomy for manual annotation. In the next step, the annotations act as training data for the machine learning algorithm. The following features are used by the algorithm: `font`, `font-size`, `bold`, `italic`, `newline` and the token content itself.

The script assumes a 3-level structure with pages as level 1 base, entries as level 2 base and senses as level 3 base. The script constructs a model for each level and trains it on 75% of the data for that model, then predicts the labels on the unlabelled data from each level. Unlabelled data is at first only available for the first level, but through prediction, second and third level data is generated as well. The model used has two inputs: one-hot encoded token features and LSTM-encoded token contents with a c-LSTM* that are merged and fed into a bidirectional LSTM and outputing a one-hot encoded label. Model details can be found in the code.

##  5. <a name='Localinstallation'></a>Local installation

Docker and docker-compose are required to run the container locally. Database is running inside a Docker container.

Clone the repository to your local computer. Copy properties from `.example.env` file to a `.env` file and fill with desired values.

    $ cat .example.env >> .env

Docker volume is bound to your local development repository and changing files will result in reloaded python application.

###  5.1. <a name='Buildingimage'></a>Building image

    $ docker-compose -f docker-compose.yml -p elexifier build

###  5.2. <a name='Startingcontainer'></a>Starting container

    $ docker-compose -f docker-compose.yml -p elexifier up

Optionally add `-d` to the command above to keep it running in the background.

Run `$ docker logs -f elexifier_flask_1` to attach to the container and view logs.

Development server will be running on http://localhost:5000/.

###  5.3. <a name='Databasemigration'></a>Database migration

When models are changed locally, migrations must be run. When done updating models, follow migration process below:

    $ docker exec -it elexifier_flask_1 /bin/bash

This will attach your terminal to docker container. When attached to the container you are able to detect and run migrations.

    $ python manage.py db migrate -m "<short_descriptive_name>"

This will compare migrations and generate an new migrations file, which contains queries used for database update.

    $ python manage.py db upgrade

This will upgrade the database according to the new migrations file.

