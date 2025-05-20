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
  <Text style={{ fontSize: 16, color: '#212121', flexWrap: 'wrap' }}>
    {parts.map((part, index) => {
      const match = part.match(/##(\d+)\$\$/);
      if (match) {
        const refIndex = parseInt(match[1]);
        const chunk = references[refIndex];
        if (chunk) {
          return (
            <Text key={index}>
              <ReferenceTooltip chunk={chunk} />
            </Text>
          );
        }
        return null;
      } else {
        return <Text key={index}>{part}</Text>;
      }
    })}
  </Text>
);
};