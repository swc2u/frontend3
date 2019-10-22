export const getWFConfig = module => {
  switch (module.toUpperCase()) {
    case "TL-SERVICES":
      return {
        INITIATED: "/tradelicence/apply",
        DEFAULT: "/tradelicence/search-preview"
      };
    case "FIRENOC":
      return {
        INITIATED: "/fire-noc/apply",
        DEFAULT: "/fire-noc/search-preview"
      };
  }
};