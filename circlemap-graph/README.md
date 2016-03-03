Draw a network graph with circlemaps as nodes.

This package has 2 templates:

  1. circleMapTemplate

  (more documentation to come)

  2. circleMapHallmarksModeTemplate

This template is intended for use displaying hallmarks-of-cancer networks. It is reactive to the following session variables:

  * sifString - sif in a string

  * hallmarksSampleData - TSV in a string, with columns: Gene, Kinases, Mutations, Amps, Dels, TFs. The Gene field designates the graph node. Kinases field is used for the node center. Remaining fields are used for a ring.