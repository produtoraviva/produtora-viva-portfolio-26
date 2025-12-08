-- Allow admins to delete orders
CREATE POLICY "Admins can delete orders" 
ON fotofacil_orders 
FOR DELETE 
USING (is_admin_session());

-- Allow admins to delete order items
CREATE POLICY "Admins can delete order items" 
ON fotofacil_order_items 
FOR DELETE 
USING (is_admin_session());