export interface SafeAreaInsets {
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
}

export interface LeaderProps {
  leader: {
    fid: number;
    address: string;
    earned: number;
    username: string;
    index: number;
    pfp: string;
    invited: number;
  };
}
