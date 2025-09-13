import { SlideInRight, SlideOutLeft } from "react-native-reanimated";

const enter = (d: number) =>
  SlideInRight.springify()
    .damping(22)
    .stiffness(90)
    .mass(1.1)
    .withInitialValues({ opacity: 0 })
    .delay(d);
const exit = (d: number) =>
  SlideOutLeft.springify().damping(22).stiffness(90).mass(1.1).delay(d);

export { enter, exit };
