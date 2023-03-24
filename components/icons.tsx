import {
  faGithub,
  faInstagram,
  faKeybase,
  faTwitter,
} from "@fortawesome/free-brands-svg-icons";
import { faBars, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import styles from "./icons.module.css";

export const GitHubIcon = () => (
  <FontAwesomeIcon className={styles.menuicon} icon={faGithub} />
);
export const InstagramIcon = () => (
  <FontAwesomeIcon className={styles.menuicon} icon={faInstagram} />
);
export const KeyBaseIcon = () => (
  <FontAwesomeIcon className={styles.menuicon} icon={faKeybase} />
);
export const TwitterIcon = () => (
  <FontAwesomeIcon className={styles.menuicon} icon={faTwitter} />
);

export const BarsIcon = () => <FontAwesomeIcon icon={faBars} />;
export const XMarkIcon = () => <FontAwesomeIcon icon={faXmark} />;
