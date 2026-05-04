'use client';

import { useEffect, useState, Fragment } from 'react';
import { useRouter } from 'next/navigation';
import { useSnackbar } from 'notistack';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import Checkbox from '@mui/material/Checkbox';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import { IconChevronDown, IconChevronUp, IconPlus, IconPencil, IconTrash } from '@tabler/icons-react';

import roleService from '@/services/role.service';
import permissionService from '@/services/permission.service';
import moduleService from '@/services/module.service';
import { useAuth } from '@/contexts/AuthContext';
import { isSuperAdmin } from '@/utils/permissions';
import AppBreadcrumb from '@/components/AppBreadcrumb';

const PermissionRow = ({ module, onPermissionChange, onDeleteModule, canManageModules }) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const hasChildren = module.children && module.children.length > 0;

  const handleChange = (field) => (event) => {
    onPermissionChange(module.id, field, event.target.checked);
  };

  return (
    <Fragment>
      <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
        <TableCell width="40">
          {hasChildren && (
            <IconButton size="small" onClick={() => setOpen(!open)}>
              {open ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
            </IconButton>
          )}
        </TableCell>
        <TableCell component="th" scope="row">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
             <Checkbox 
                checked={module.permissions.can_view && module.permissions.can_create && module.permissions.can_edit && module.permissions.can_delete}
                indeterminate={
                  (module.permissions.can_view || module.permissions.can_create || module.permissions.can_edit || module.permissions.can_delete) &&
                  !(module.permissions.can_view && module.permissions.can_create && module.permissions.can_edit && module.permissions.can_delete)
                }
                onChange={(e) => {
                  const val = e.target.checked;
                  ['can_view', 'can_create', 'can_edit', 'can_delete'].forEach(field => {
                    onPermissionChange(module.id, field, val);
                  });
                }}
             />
             <Typography variant="body1" sx={{ fontWeight: hasChildren ? 600 : 400 }}>
                {module.name}
             </Typography>
          </Box>
        </TableCell>
        <TableCell align="center">
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
            <Checkbox checked={!!module.permissions.can_create} onChange={handleChange('can_create')} />
            <Typography variant="caption">Add</Typography>
          </Box>
        </TableCell>
        <TableCell align="center">
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
            <Checkbox checked={!!module.permissions.can_view} onChange={handleChange('can_view')} />
            <Typography variant="caption">View</Typography>
          </Box>
        </TableCell>
        <TableCell align="center">
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
            <Checkbox checked={!!module.permissions.can_edit} onChange={handleChange('can_edit')} />
            <Typography variant="caption">Edit</Typography>
          </Box>
        </TableCell>
        <TableCell align="center">
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
            <Checkbox checked={!!module.permissions.can_delete} onChange={handleChange('can_delete')} />
            <Typography variant="caption">Delete</Typography>
          </Box>
        </TableCell>
        {canManageModules && (
          <TableCell align="right">
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
              <IconButton 
                size="small" 
                onClick={() => router.push(`/dashboard/modules/create?id=${module.id}`)}
                color="primary"
              >
                <IconPencil size={16} />
              </IconButton>
              <IconButton 
                size="small" 
                onClick={() => onDeleteModule(module.id)}
                color="error"
              >
                <IconTrash size={16} />
              </IconButton>
            </Box>
          </TableCell>
        )}
      </TableRow>
      {hasChildren && (
        <TableRow>
          <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={canManageModules ? 7 : 6}>
            <Collapse in={open} timeout="auto" unmountOnExit>
              <Box sx={{ margin: 1 }}>
                <Table size="small">
                  <TableBody>
                    {module.children.map((child) => (
                      <TableRow key={child.id}>
                        <TableCell width="40" />
                        <TableCell component="th" scope="row">
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pl: 2 }}>
                             <Checkbox 
                                checked={child.permissions.can_view && child.permissions.can_create && child.permissions.can_edit && child.permissions.can_delete}
                                onChange={(e) => {
                                  const val = e.target.checked;
                                  ['can_view', 'can_create', 'can_edit', 'can_delete'].forEach(field => {
                                    onPermissionChange(child.id, field, val);
                                  });
                                }}
                             />
                             <Typography variant="body2">{child.name}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                           <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                            <Checkbox checked={!!child.permissions.can_create} onChange={(e) => onPermissionChange(child.id, 'can_create', e.target.checked)} />
                            <Typography variant="caption">Add</Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                            <Checkbox checked={!!child.permissions.can_view} onChange={(e) => onPermissionChange(child.id, 'can_view', e.target.checked)} />
                            <Typography variant="caption">View</Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                            <Checkbox checked={!!child.permissions.can_edit} onChange={(e) => onPermissionChange(child.id, 'can_edit', e.target.checked)} />
                            <Typography variant="caption">Edit</Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                            <Checkbox checked={!!child.permissions.can_delete} onChange={(e) => onPermissionChange(child.id, 'can_delete', e.target.checked)} />
                            <Typography variant="caption">Delete</Typography>
                          </Box>
                        </TableCell>
                        {canManageModules && (
                          <TableCell align="right">
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                              <IconButton 
                                size="small" 
                                onClick={() => router.push(`/dashboard/modules/create?id=${child.id}`)}
                                color="primary"
                              >
                                <IconPencil size={16} />
                              </IconButton>
                              <IconButton 
                                size="small" 
                                onClick={() => onDeleteModule(child.id)}
                                color="error"
                              >
                                <IconTrash size={16} />
                              </IconButton>
                            </Box>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            </Collapse>
          </TableCell>
        </TableRow>
      )}
    </Fragment>
  );
};

export default function PermissionsView() {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useAuth();
  const canManageModules = isSuperAdmin(user);

  const [roles, setRoles] = useState([]);
  const [selectedRoleId, setSelectedRoleId] = useState('');
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchRoles();
  }, []);

  useEffect(() => {
    if (selectedRoleId) {
      fetchPermissions(selectedRoleId);
    } else {
      setModules([]);
      setLoading(false);
    }
  }, [selectedRoleId]);

  const fetchRoles = async () => {
    try {
      const res = await roleService.getRoles();
      setRoles(res.data || []);
      if (res.data && res.data.length > 0) {
        setSelectedRoleId(res.data[0].id.toString());
      }
    } catch {
      enqueueSnackbar('Failed to load roles', { variant: 'error' });
      setLoading(false);
    }
  };

  const fetchPermissions = async (roleId) => {
    setLoading(true);
    try {
      const res = await permissionService.getPermissionsByRole(roleId);
      setModules(res.data || []);
    } catch {
      enqueueSnackbar('Failed to load permissions', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handlePermissionChange = (moduleId, field, value) => {
    setModules((prevModules) => {
      const newModules = JSON.parse(JSON.stringify(prevModules));
      const findAndUpdate = (list) => {
        for (let item of list) {
          if (item.id === moduleId) {
            item.permissions[field] = value;
            return true;
          }
          if (item.children && findAndUpdate(item.children)) {
            return true;
          }
        }
        return false;
      };
      findAndUpdate(newModules);
      return newModules;
    });
  };

  const handleDeleteModule = async (moduleId) => {
    if (!window.confirm('Are you sure you want to delete this module?')) return;
    
    try {
      const res = await moduleService.deleteModule(moduleId);
      if (res.success) {
        enqueueSnackbar(res.message || 'Module deleted successfully', { variant: 'success' });
        // Refresh permissions list
        if (selectedRoleId) fetchPermissions(selectedRoleId);
      }
    } catch (error) {
      const msg = error?.response?.data?.message || 'Failed to delete module';
      enqueueSnackbar(msg, { variant: 'error' });
    }
  };

  const handleUpdate = async () => {
    if (!selectedRoleId) return;
    setSaving(true);
    try {
      const flatPermissions = [];
      const flatten = (list) => {
        list.forEach(m => {
          flatPermissions.push({
            module_id: m.id,
            ...m.permissions
          });
          if (m.children) flatten(m.children);
        });
      };
      flatten(modules);

      await permissionService.assignPermissions({
        role_id: selectedRoleId,
        permissions: flatPermissions
      });
      enqueueSnackbar('Permissions updated successfully', { variant: 'success' });
    } catch {
      enqueueSnackbar('Failed to update permissions', { variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ width: '100%', p: 2 }}>
      <AppBreadcrumb
  items={[
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Permissions' }
  ]}
/>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h3">Roles & Permissions</Typography>
        {canManageModules && (
          <Button 
            variant="contained" 
            startIcon={<IconPlus size={18} />}
            onClick={() => router.push('/dashboard/modules/create')}
          >
            Add Module
          </Button>
        )}
      </Box>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ mb: 4, maxWidth: 400 }}>
          <InputLabel sx={{ mb: 1 }}>Select the Role</InputLabel>
          <Select
            value={selectedRoleId}
            onChange={(e) => setSelectedRoleId(e.target.value)}
            fullWidth
            size="small"
          >
            {roles.map((role) => (
              <MenuItem key={role.id} value={role.id.toString()}>
                {role.name}
              </MenuItem>
            ))}
          </Select>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Fragment>
            <TableContainer component={Box}>
              <Table size="medium">
                <TableHead>
                  <TableRow>
                    <TableCell width="40" />
                    <TableCell>Module Name</TableCell>
                    <TableCell align="center">Add</TableCell>
                    <TableCell align="center">View</TableCell>
                    <TableCell align="center">Edit</TableCell>
                    <TableCell align="center">Delete</TableCell>
                    {canManageModules && <TableCell align="right">Actions</TableCell>}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {modules.map((module) => (
                    <PermissionRow 
                      key={module.id} 
                      module={module} 
                      onPermissionChange={handlePermissionChange} 
                      onDeleteModule={handleDeleteModule}
                      canManageModules={canManageModules}
                    />
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Box sx={{ mt: 4 }}>
              <Button
                variant="contained"
                fullWidth
                size="large"
                onClick={handleUpdate}
                disabled={saving || !selectedRoleId}
              >
                {saving ? 'Updating...' : 'Update'}
              </Button>
            </Box>
          </Fragment>
        )}
      </Paper>
    </Box>
  );
}
