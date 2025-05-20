import React from 'react';
import { Text, View } from 'react-native';
import { ReferenceTooltip } from './ReferenceTooltip';

export const AnswerWithReferences = ({
  answer,
  references,
}: {
  answer: string;
  references: any[];
}) => {
  const parts = answer.split(/(##\d+\$\$)/g);

  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
      {parts.map((part, index) => {
        const match = part.match(/##(\d+)\$\$/);
        if (match) {
          const refIndex = parseInt(match[1]);
          const chunk = references[refIndex];
          if (chunk) return <ReferenceTooltip key={index} chunk={chunk} />;
          return null;
        } else {
          return (
            <Text key={index} style={{ fontSize: 16, color: '#212121' }}>
              {part}
            </Text>
          );
        }
      })}
    </View>
  );
};