import { Typography } from "@mui/material";
import { styled } from "@mui/material/styles";

export default styled(Typography)`
  background: linear-gradient(
    135deg,
    #b1b8e3,
    #a2aada,
    #9099ce,
    #818bc2,
    #6571b6,
    #4e5a9e,
    #444f8c,
    #353e72,
    #2d3668,
    #272f5f
  );
  background-size: 200%;
  animation: gradient-flow 10s ease-in-out infinite;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;
