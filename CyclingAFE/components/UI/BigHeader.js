import React from 'react';
import {Text, StyleSheet} from 'react-native';
import Fonts from '../../constants/fonts';
import Colors from '../../constants/colors';

const BigHeader = props => {
  return (
    <Text {...props} style={{...styles.text, ...props.style}}>
      {props.children}
    </Text>
  );
};

const styles = StyleSheet.create({
  text: {
    fontFamily: 'NunitoSans-Bold',
    fontSize: Fonts.BigHeader.fontSize,
    padding: 20,
    textAlign: "center",
    padding: Fonts.BigHeader.padding,
    textAlign: Fonts.BigHeader.textAlign,
  },
});

export default BigHeader;
