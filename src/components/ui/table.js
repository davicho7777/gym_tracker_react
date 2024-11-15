import React from 'react';

const Table = ({ children }) => (
  <table className="min-w-full divide-y divide-gray-200">
    {children}
  </table>
);

const TableHeader = ({ children }) => (
  <thead className="bg-gray-100">
    {children}
  </thead>
);

const TableBody = ({ children }) => (
  <tbody className="bg-white divide-y divide-gray-200">
    {children}
  </tbody>
);

const TableRow = ({ children }) => (
  <tr>
    {children}
  </tr>
);

const TableHead = ({ children }) => (
  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
    {children}
  </th>
);

const TableCell = ({ children }) => (
  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
    {children}
  </td>
);

export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell };